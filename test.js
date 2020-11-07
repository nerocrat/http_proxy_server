const https = require('https');
const fs = require('fs');

/*
linux:
openssl genrsa -out client-key.pem 2048
openssl req -new -key client-key.pem -out client.csr
openssl x509 -req -in client.csr -signkey client-key.pem -out client-cert.pem
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