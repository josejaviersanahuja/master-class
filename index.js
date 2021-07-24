/**
 * Primary file for the API
 * 
 * 
 */
// Dependencies

const http = require("http");
const https = require('https')
const {URL} = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const fs = require('fs')
/**************************************
 *              ROUTER and HANDLERS
 * *************************************** */

//defining CONST handler and route
const handler = {};

handler.ping = function (data, callback) {
  // calback a status code and a payload
  callback(200);
};

handler.notFound = function (data, callback) {
  // callback a status code 404 and maybe a payload
  callback(404);
};

handler.hello = function (data, callback) {
  callback(200, {"message":"Welcome to the API of ZITROJJDEV"})
}

// we define a router to choose which handler will handle which url req
const router = {
  'ping': handler.ping,
  'hello':handler.hello,
  'notFound': handler.notFound
};
//
/*************************************
 *          END OF ROUTER AND HANDLER
 * ************************************ */

/*****************************************
 *          CONFIG
 * ****************************************** */

/**
 * Creating an export configuration variables.
 */

// Container for all the enviroments
let enviroments = {};

// Staging Object (default enviroment)
enviroments.staging = {
  'httpPort': 3000,
  'httpsPort': 3001,
  'envName': "staging", // could be development
};

enviroments.production = {
  'httpPort': 5000,
  'httpsPort': 5001,
  'envName': "production",
};

// Determine which enviroment export.
const currentEnviroment =
  typeof process.env.NODE_ENV == "string"
    ? process.env.NODE_ENV.toLowerCase()
    : "";
// debbugconsole.log(process.env.NODE_ENV, 'en config file');
// Check that the current enviroment is one of the enviroments above.

const enviromentToExport =
  typeof enviroments[currentEnviroment] == "object"
    ? enviroments[currentEnviroment]
    : enviroments.staging;

    const config= enviromentToExport
/*****************************************
 *         END OF  CONFIG
 * ****************************************** */

// The server should respond to all requests with a string
const httpServer = http.createServer(function(req, res){
  unifiedServer(req, res)
});

// Start the server, and have it listen on port 3000
httpServer.listen(config.httpPort, () => {
  console.log("Server up and listening on port: " + config.httpPort +' in ' + config.envName + ' mode');
});

/* // The HTTPS
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
});  */

/****************************
 *          SERVER UNIFIED FUNCTION
 ***************************/

const unifiedServer = (req, res) => {
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
      'payload' : buffer
    }
      //we choose a 
      
      const chosenHandler = router[trimmedPath] || router.notFound
        
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

