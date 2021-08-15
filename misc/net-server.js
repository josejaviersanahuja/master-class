/**
 * EXAMPLE TCP (NET) SERVER
 * 
 */

//DEPENDENCIES 
const net = require('net')

//Creating a server
const server = net.createServer(function(connection){
    //Send pong
    const outboundMessage = 'pong'
    connection.write(outboundMessage)

    //When the client writes something, log it out
    connection.on('data', function(inboundMessage){
        const messageString = inboundMessage.toString()
        console.log('I wrote: '+outboundMessage+ ' and they replied with '+messageString);
    })
})

//Listen
server.listen(6000,()=>{
    console.log('Server connected in port 6000');
})