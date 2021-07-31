/**
 * Primary file for the API
 * 
 * 
 */
// Dependencies
const server = require('./server/server')
const workers = require('./lib/workers')
const {privateKeys} = require('./lib/dotEnvReader')
// app container
const app = {}

// Initializing an app starts by initializing the server
app.init = function(){
  server.init()
  workers.init()
}

// executing initialization
app.init()
/* setTimeout(function(){
  console.log(privateKeys);
}, 6) */
module.exports = app
