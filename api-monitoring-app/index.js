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

// app container
const app = {}

// Initializing an app starts by initializing the server
app.init = function(){
  server.init()
  //workers.init()

  //cli must be shown after the initial messages
  setTimeout(function(){
    cli.init()
  },50)
}
//envolvemos el app init en nuestro dotENV para que las variables de entorno carguen antes de iniciar la app
dotEnvReader(app.init)

module.exports = app
