/**
 * EXAMPLE TLS CLIENT
 * 
 */

//DEPENDENCIES 
const tls = require('tls')
const fs = require('fs')
const path = require('path')

//SERVER OPTIONS
// ONLY required because is a selfcertificate
const tlsServerOptions = {
    'ca': fs.readFileSync(path.join(__dirname, '../api-monitoring-app/https/cert.pem'))
  }

//Define the message into a buffer
const outboundMessage = 'Ping'

//Create the client
const client = tls.connect(6000,tlsServerOptions ,function(){
    //Send the message
    client.write(outboundMessage)
})

//When the server writes back, log and kill the client
client.on('data',function(inboundMessage){
    const messageString = inboundMessage.toString()
    console.log('I wrote: '+outboundMessage+ ' and they replied with '+messageString);
    client.end()
})
