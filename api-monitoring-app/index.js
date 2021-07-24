/**
 * Primary file for the API
 * 
 * 
 */
// Dependencies

const http = require("http");
const https = require('https')
const unifiedServer = require('./server')
const config = require('./config')
const fs = require('fs')
const __data = require('./lib/data')

//TESTING
// @TODO delete this
__data.read('test','newFile', function(err, data){
  console.log('this was the error: ', err, data);
})

// The server should respond to all requests with a string
const httpServer = http.createServer(function(req, res){
  unifiedServer(req, res)
});

// Start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, () => {
  console.log("Server up and listening on port: " + config.httpPort +' in ' + config.envName + ' mode');
});

// The HTTPS
const httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),
  'cert': fs.readFileSync('./https/cert.pem')
}

// console.log(httpsServerOptions);
const httpsServer = https.createServer(httpsServerOptions, function(req, res){
  unifiedServer(req, res)
});

// Start the server HTTPS, and have it listen on port 3001
httpsServer.listen(config.httpsPort, () => {
  console.log("Server up and listening on port: " + config.httpsPort +' in ' + config.envName + ' mode');
}); 
