/**
 * Primary file for the API
 * 
 * 
 */
// Dependencies
const server = require('./server/server')
const workers = require('./lib/workers')
const {dotEnvReader} = require('./lib/helpers')
// app container
const app = {}

// Initializing an app starts by initializing the server
app.init = function(){
  server.init()
  workers.init()
  dotEnvReader()
}

// executing initialization
app.init()

//Exporting APP for testing
module.exports = app
