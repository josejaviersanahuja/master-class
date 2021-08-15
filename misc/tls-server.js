/**
 * EXAMPLE TLS SERVER
 * 
 */

//DEPENDENCIES 
const tls = require('tls')
const fs = require('fs')
const path = require('path')

//SERVER OPTIONS
// The HTTPS
const tlsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname, '../api-monitoring-app/https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname, '../api-monitoring-app/https/cert.pem'))
  }

//Creating a server
const server = tls.createServer(tlsServerOptions , function(connection){
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