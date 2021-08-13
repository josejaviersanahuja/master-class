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
app.init = function(callback){
  server.init()
  workers.init()
  

  //cli must be shown after the initial messages
  setTimeout(function(){
    cli.init()
    
    callback()
  },50)
}
//envolvemos el app init en nuestro dotENV para que las variables de entorno carguen antes de iniciar la app
if (require.main===module) { //solo se ejecuta si la ejecucion se pide por CLI node index.js por ejemplo
  
  dotEnvReader(app.init, function(){})  
}
//CUANDO NO SE EJECUTA? cuando desde nuestro test/api.js llamamos a la app


module.exports = app
