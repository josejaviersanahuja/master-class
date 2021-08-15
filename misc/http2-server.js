/**
 * Example http2 DEMO
 * 
 */
//DEPENDENCIES
const http2 = require('http2')

//creating the server
const server = http2.createServer()

// On Stream, send back hello world
server.on('stream', function(stream, headers){
    stream.respond({
        'status':200,
        'content-Type':'text/html'
    })
    stream.end('<html><body><h1>Hello Wolrd</h1></body></html>')
})

// listen port 6000
server.listen(6000, ()=>{
    console.log('Server connected in port 6000');
})