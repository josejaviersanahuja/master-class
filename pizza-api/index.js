/**
 * Primary file for the API
 * 
 * 
 */
// Dependencies
const server = require('./server/server')
const {dotEnvReader} = require('./lib/dotEnvReader')
const loggingWatcher = require('./lib/loggingWatcher')

 // app container
const app = {}

// Initializing an app starts by initializing the server
app.init = function(){
  server.init()
  loggingWatcher.init()
}

// executing initialization
dotEnvReader(app.init)

module.exports = app
