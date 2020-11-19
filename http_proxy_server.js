const http = require('http');
const https = require('https');
const net = require('net');
const url = require('url');
class Http_proxy_server {
    constructor(options) {
        this._config = {};
        if (options.basic_auth_data) {
            const[proxy_login, proxy_pass] = options.basic_auth_data.split(':');
            if (!proxy_login || !proxy_pass) {
                throw new Error('Incorrect login data');
            }
            this._config.proxy_login = proxy_login;
            this._config.proxy_pass = proxy_pass;
        }
        Object.assign(this._config, options);
        if (!this._config.proxy_auth)
            this._check_auth = () => {
                return true
            };
    }
    create_server() {
        const options = Object.assign({}, this._config);
        delete options.proxy_auth;
        delete options.https_server;
        delete options.proxy_chain_auth;
        delete options.basic_auth_data;
        delete options.nokeepalive;
        const server = (this._config.https_server ? https : http).createServer(options, on_request.bind(this));
        server.on('connect', on_connect.bind(this));
        return server;
    }
    _check_auth(req, res) {
        if (!req.headers['proxy-authorization']) {
            res.write(['HTTP/1.1 407 Proxy Authentication Required', 'Proxy-Authenticate: Basic realm="proxy"', 'Proxy-Connection: close', ].join('\r\n'));
            res.end('\r\n\r\n');
            return false;
        } else {
            let[type, credentials] = req.headers['proxy-authorization'].split(' ');
            if (type !== 'Basic' || !credentials || credentials === 'Og==') {
                res.write(['HTTP/1.1 407 Proxy Authentication Required', 'Proxy-Authenticate: Basic realm="proxy"', 'Proxy-Connection: close', ].join('\r\n'));
                res.end('\r\n\r\n');
                return false;
            }
            let[username, pass] = Buffer.from(credentials, 'base64').toString('utf8').split(':');
            console.log(username, pass)
            if (username !== this._config.proxy_login || pass !== this._config.proxy_pass) {
                res.write(['HTTP/1.1 407 Proxy Authentication Required', 'Proxy-Authenticate: Basic realm="proxy"', 'Proxy-Connection: close', ].join('\r\n'));
                res.end('\r\n\r\n');
                return false;
            }
        }
        return true;
    }
}
function on_request(client_req, client_res) {
    try {
        console.log('http serve: ' + client_req.url);
        if (!this._check_auth(client_req, client_res.socket))
            return;
        const dst = new URL(client_req.url);
        if (client_req.headers['proxy-connection'] !== undefined) {
            client_req.headers['connection'] = client_req.headers['proxy-connection'];
            delete client_req.headers['proxy-connection'];
        }
        if (!this._config.proxy_chain_auth)
            delete client_req.headers['proxy-authorization'];
        var options = {
            hostname: client_req.headers['host'],
            port: dst.port,
            path: dst.pathname,
            method: client_req.method,
            headers: client_req.headers
        };
        const client_error_handler = err => {
            console.warn(`client socket error: ${err.message}`)
            if (!proxy_req.writableEnded)
                proxy_req.end();
        }
        const server_error_handler = err => {
            console.warn(`server socket error: ${err.message}`)
            if (!client_res.writableEnded)
                client_res.end(`HTTP/1.1 500 ${err.message}\r\n`)
        }
        const proxy_req = http.request(options, function (res) {
            client_res.writeHead(res.statusCode, res.headers)
            res.pipe(client_res);
        });
        client_req.on('error', client_error_handler);
        proxy_req.on('error', server_error_handler);
        client_req.pipe(proxy_req);
    } catch (e) {
        if (e.code === 'ERR_INVALID_URL') {
            console.log(`bad requested url: ${client_req.url}`)
            client_res.end('HTTP/1.1 400 Bad Request\r\n');
            client_req.destroy();
        } else {
            console.error(`proxy server error: ${e.message}`)
            client_res.end(`HTTP/1.1 500 Internal Server Error\r\n`);
        }
    }
}
function on_connect(req, client_socket, head) {
    try {
        console.log(client_socket.remoteAddress, client_socket.remotePort, req.method, req.url)
        if (!this._check_auth(req, client_socket))
            return;
        const dst = new URL(`http://${req.url}`);
        const client_error_handler = err => {
            console.warn(`client socket error: ${err.message}`)
            if (!server_socket.destroyed) {
                server_socket.end();
            }
        }
        const server_error_handler = err => {
            console.warn(`server socket error: ${err.message}`)
            if (!client_socket.destroyed) {
                client_socket.end(`HTTP/1.1 500 ${err.message}\r\n`)
            }
        }
        const server_socket = net.createConnection(dst.port || 80, dst.hostname);
        client_socket.on('error', client_error_handler);
        server_socket.on('error', server_error_handler);
        server_socket.on('connect', () => {
            client_socket.write(['HTTP/1.1 200 Connection Established', ].join('\r\n'))
            client_socket.write('\r\n\r\n')
            server_socket.pipe(client_socket);
            client_socket.pipe(server_socket);
        })
    } catch (e) {
        if (e.code === 'ERR_INVALID_URL') {
            console.log(`bad requested url: ${req.url}`)
            client_socket.end('HTTP/1.1 400 Bad Request\r\n');
            client_socket.destroy();
        } else {
            console.error(`proxy server error: ${e.message}`)
            client_socket.end(`HTTP/1.1 500 Internal Server Error\r\n`);
        }
    }
}
module.exports = {
    create: function (config) {
        return (new Http_proxy_server(config)).create_server();
    }
}
