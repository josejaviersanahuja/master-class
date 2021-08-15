/**
 * EXAMPLE NET TCP CLIENT
 * 
 */

//DEPENDENCIES 
const net = require('net')

//Define the message into a buffer
const outboundMessage = 'Ping'

//Create the client
const client = net.createConnection({port:6000}, function(){
    //Send the message
    client.write(outboundMessage)
})

//When the server writes back, log and kill the client
client.on('data',function(inboundMessage){
    const messageString = inboundMessage.toString()
    console.log('I wrote: '+outboundMessage+ ' and they replied with '+messageString);
    client.end()
})
