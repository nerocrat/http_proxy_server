const https = require('https');
const fs = require('fs');

/*
linux:
openssl req -x509 -newkey rsa:2048 -sha256 -days 3650 -nodes -keyout server-key.pem -out server-cert.pem -subj /CN=<ip> -addext subjectAltName=IP:<ip>
*/


const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
};
/*
const options = {
  pfx: fs.readFileSync('cert.pfx'),
  passphrase: 'test_cert'
};
*/

https.createServer(options, function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}).listen(443);