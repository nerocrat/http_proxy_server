const
  socks5 = require('simple-socks'),
  server = socks5.createServer().listen(1080, function () {
  console.log('SOCKS5 proxy server started');
});
  
 
 server.on('proxyConnect', (info, destination) => {
  console.log('connected to remote server at %s:%d', info.address, info.port);
});