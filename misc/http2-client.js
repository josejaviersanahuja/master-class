/**
 * Example HTTP2 Client
 * 
 */

//DEPENDENCIES
const http2 = require('http2')

//Create a Client
const client = http2.connect('http://localhost:6000')

//Create a req

const req = client.request({
    'path':'/'
})

//When a message is received, add the pieces of it together until you reach the end
let str = ''
req.on('data',function(chunk){
    str+=chunk
})

//When the message end, log it out
req.on('end', function(){
    console.log(str);
})

//End req
req.end()