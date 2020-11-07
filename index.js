const fs = require('fs');
const socks5 = require('simple-socks')

const [ user_name, pass ] = fs.readFileSync("./login", "utf8").match(/^.+/gm);
if (!pass) {
    console.error('Incorrect login data');
    process.exit(1)
}

const server = socks5.createServer({
		authenticate : function (username, password, socket, callback) {
			if (username !== user_name || password !== pass) {
				return setImmediate(callback, new Error('invalid credentials'));
			}

			return setImmediate(callback);
		}
	}).listen(process.env.PORT || 8000, () => {
		let addr = server.address();
		console.log(`SOCKS5 proxy server started on ${typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port}`);
});
  
 
 server.on('proxyConnect', (info, destination) => {
  console.log('connected to remote server at %s:%d', info.address, info.port);
});