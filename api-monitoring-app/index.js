/**
 * Primary file for the API
 */
//------------------------------------------------------------------------------
//defining handlers
const handler = {};

handler.sample = function (data, callback) {
  // calback a status code and a payload
  callback(406, { name: "sanmple handler" });
};

handler.notFound = function (data, callback) {
  // callback a status code 404 and maybe a payload
  callback(404);
};

// we define a router to choose which handler will handle which url req
const router = {
  sample: handler.sample,
};
//------------------------------------------------------------------------------
// Dependencies
const http = require("http");
const {URL} = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

// The server should respond to all requests with a string
const server = http.createServer((req, res) => {
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
    
    const chosenHandler = router[trimmedPath] || handler.notFound
      
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
        res.writeHead(statusCode)

        res.end(payloadString)
        console.log('returning response: ', statusCode, payloadString);
    })
  });
});

// Start the server, and have it listen on port 3000
const port = 3002;
server.listen(port, () => {
  console.log("Server up and listening on port: " + port);
});
