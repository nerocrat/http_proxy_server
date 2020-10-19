const
  socks5 = require('simple-socks'),
  server = socks5.createServer().listen(process.env.PORT || 1080, function () { // heroku динамически назначает порт в env, указать фиксированный нельзя
  console.log('SOCKS5 proxy server started');
});
  
 
 server.on('proxyConnect', (info, destination) => {
  console.log('connected to remote server at %s:%d', info.address, info.port);
});