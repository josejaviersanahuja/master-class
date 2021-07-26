const router = require('./router')
const {URL} = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
const helpers = require('../lib/helpers');

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
      'payload' : helpers.parseJsonToObject(buffer)
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

module.exports = unifiedServer