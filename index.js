const fs = require('fs');
const http_proxy_server = require('./http_proxy_server');
const config = {
    proxy_auth: false,
    https_server: true,
    proxy_chain_auth: false,
    //basic_auth_data: fs.readFileSync('login', { encoding: 'utf8' }),
    cert: fs.readFileSync('server-cert.pem'),
    key: fs.readFileSync('server-key.pem'),
    ca: fs.readFileSync('server-cert.pem'),
    requestCert: true,
    rejectUnauthorized: true,
}
const port = 80;
const server = http_proxy_server.create(config);
const listener = server.listen(port, err => {
    if (err)
        return console.error(err);
    const info = listener.address();
    console.log(`Server is listening on address ${info.address} port ${info.port}`);
})
