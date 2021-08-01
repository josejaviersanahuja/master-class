/**
 * Primary file for the API
 * 
 * 
 */
// Dependencies
const server = require('./server/server')
const {dotEnvReader} = require('./lib/dotEnvReader')
// app container
const app = {}

// Initializing an app starts by initializing the server
app.init = function(){
  server.init()
}

// executing initialization
dotEnvReader(server.init)

module.exports = app
