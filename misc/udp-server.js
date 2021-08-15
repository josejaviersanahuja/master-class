/**
 * EXAMPLE UDP SERVER
 * 
 */

//DEPENDENCIES 
const dgram = require('dgram')

//Creating a server
const server = dgram.createSocket('udp4')

server.on('message', function(messageBuffer, sender){
    //Do something with the request
    const messageString = messageBuffer.toString()
    console.log(messageString);
})

//Listen
server.bind(6000,()=>{
    console.log('Server connected in port 6000');
})