/**
 * EXAMPLE UDP CLIENT
 * 
 */

//DEPENDENCIES 
const dgram = require('dgram')

//Create the client
const client = dgram.createSocket('udp4')

//Define the message into a buffer
const messageString = 'This is a message'
const messageBuffer = Buffer.from(messageString)

//Send of the message
client.send(messageBuffer,6000,'localhost', function(err){
    client.close()
})