/**
 *  SERVER Starter
 */

// DEPENDENCIES
const http = require("http");
const https = require('https')
const config = require('../config')
const fs = require('fs')
const path = require('path')
const handler = require('./handlers')
const {URL} = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const helpers = require('../lib/helpers');

//------------------------------------------------------------------------------------------------------------
                            // defining the module object server
//------------------------------------------------------------------------------------------------------------
const server = {}
/*************************************************
 *        HTTP & HTTPS
 * ********************************************** */
// The server should respond to all requests with a string
  server.httpServer = http.createServer(function(req, res){
    server.unifiedServer(req, res)
  });
  
// The HTTPS
  const httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '../https/cert.pem'))
  }

  server.httpsServer = https.createServer(httpsServerOptions, function(req, res){
    server.unifiedServer(req, res)
  });
/**************************************************************
 *              UNIFIED --------------- SERVER
 * *********************************************************** */

 server.unifiedServer = (req, res) => {
  //get the url and pars it
  const parsedUrl = new URL(req.url, 'http://localhost:3002') // url.parse(req.url, true); // second argument accepts another dependencies we haven´t used (query) that's why we pass true unti we get there

  // geth the path
  const path = parsedUrl.pathname; // http:localhost:3000/pokemon pathname would be /pokemon
  const trimmedPath = path.replace(/^\/+|\/+$/g, ""); // regex is to trimm of any extra slashes. i.e. localhost:3000/pokemon = localhost:3000/pokemon/ y cosas similares

  // Get query string as an object
  const queryStringObject = parsedUrl.searchParams

  const method = req.method.toLowerCase();

  // Get the headers as an object
  const headers = req.headers;

  // Get the payload
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();
    
  // construct the data object to send to the handlre
  const data = {
    'trimmedPath' : trimmedPath,
    'queryStringObject' : queryStringObject,
    'method' : method,
    'headers' : headers,
    'payload' : helpers.parseJsonToObject(buffer)
  }
       
  //we choose a handler and we use the route to do it
 const chosenHandler = server.router[trimmedPath] || server.router.notFound
      
// check entry data     console.log('recibimos estos datos: ', trimmedPath, buffer, method, headers);
    //Route the request to the handler specified
    chosenHandler(data, function(statusCode, payload){
        //use status code callback by the handler or default 200
      statusCode= typeof(statusCode) == 'number' ? statusCode : 200
        //use the payload callback by the handlrer or a default empty object
      payload = typeof(payload) == 'object' ? payload : {}
        
      // convert the payload to a string
      const payloadString = JSON.stringify(payload)
        
        //return the response
        res.setHeader('Content-Type', 'application/json')        
        res.writeHead(statusCode)
        res.end(payloadString)
        console.log('returning response: ', statusCode, payloadString);
    })
  });
} 

/************************************************
 *                    ROUTER
 * ********************************************* */
// we define a router to choose which handler will handle which url req
server.router = {
    ping: handler.ping,
    users: handler.users,
    tokens: handler.tokens,
    notFound: handler.notFound,
    checks: handler.checks,
  };

//------------------------------------------------------------------------------------------------------------
                            // server starter function
//------------------------------------------------------------------------------------------------------------                            
server.init = function(){
    // Start the server, and have it listen on port 3000
    server.httpServer.listen(config.httpPort, () => {
        console.log("Server up and listening on port: " + config.httpPort +' in ' + config.envName + ' mode');
    });
    
    // Start the server HTTPS, and have it listen on port 3001
    server.httpsServer.listen(config.httpsPort, () => {
    console.log("Server up and listening on port: " + config.httpsPort +' in ' + config.envName + ' mode');
  }); 
  
}

//------------------------------------------------------------------------------------------------------------
                            // EXPORTING MODULE
//------------------------------------------------------------------------------------------------------------

module.exports = server

  