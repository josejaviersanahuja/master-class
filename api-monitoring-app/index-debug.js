/**
 * Primary file for the API
 * 
 * 
 */
// Dependencies
const server = require('./server/server')
const workers = require('./lib/workers')
const {dotEnvReader} = require('./lib/dotEnvReader')
const cli = require('./lib/cli')
const exampleDebuggerProblem = require('./lib/exampleDebuggingProblem')

// app container
const app = {}
debugger
// Initializing an app starts by initializing the server
app.init = function(){
  server.init()
  //workers.init()
debugger
  //cli must be shown after the initial messages
  setTimeout(function(){
    debugger
    cli.init()
    debugger
  },50)
debugger
  let unknown = 1 
  debugger
  unknown = 1   +5

  unknown    = unknown*unknown
debugger
  unknown=unknown.toString()
debugger
  //CALL the DEBUGGING FUNCTION
  exampleDebuggerProblem.init()
  debugger
}
//envolvemos el app init en nuestro dotENV para que las variables de entorno carguen antes de iniciar la app
dotEnvReader(app.init)
debugger
module.exports = app
