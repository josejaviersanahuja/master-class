/**
 * Helpers for various tasks
 */
// Dependencies
const crypto = require('crypto')
const config = require('../config')
const https = require('https')
const querystring = require('querystring')
const path = require('path')
const fs = require('fs')

//container for all helpers
const helpers = {}

//Create a SHA256 hash
helpers.hash = function (str){
    if(typeof(str)=='string' && str.length > 0){
        const hash= crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex')
        return hash
    }else {
        return false
    }
}

// Parse a json string to an object in all cases, without throwing errors
helpers.parseJsonToObject = function(str){
    try{
        const obj = JSON.parse(str)
        return obj
    }catch(e){
        return {}
    }
}

// create a random alphanumeric id of num length
helpers.createRandomString = function(num){
    num = typeof(num) == 'number' && num > 0 ? num : false
    if (num) {
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

        let finalID = ''

        for (let index = 0; index < num; index++) {
            const randomElement = possibleCharacters.charAt(Math.floor(Math.random()*possibleCharacters.length))

            finalID += randomElement
        }

        return finalID
    } else {
        return false
    }
}

/****************************************************
 *                  TWILIO
 * ************************************************* */

helpers.sendTwilioSms =  function(phone, msg, twilioCallbackError) {
    //Validate parameters
    phone = typeof phone == 'string' && phone.trim().length === 11 ? phone.trim() : false
    msg = typeof msg == 'string' && msg.trim().length > 0 && msg.length <=1600 ? msg.trim() : false
    if (phone && msg) {
        //Configure the request payload
        const payload = {
            'From': config.twilio.fromPhone,
            'To': '+'+phone,
            'Body':msg
        }
        
        // Stringify payload
        const stringPayload = querystring.stringify(payload)

        //Configure the request
        const requestDetails = {
            'protocol': 'https:',
            'hostname': 'api.twilio.com',
            'method': 'POST',
            'path': '/2010-04-01/Accounts/'+ config.twilio.accountSid + '/Messages.json',
            'auth': config.twilio.accountSid+':'+config.twilio.authToken,
            'headers': {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': Buffer.byteLength(stringPayload)
            }
        }
        // Instantiate the request object
        const req = https.request(requestDetails, function(res){
            //Grab the status of the sent request
            const status = res.statusCode
            // Callback succesfully if the request went through
            if(status == 200 || status == 201 ){
                twilioCallbackError(false)
            }else{
                twilioCallbackError('Status code returned was: '+status)
            }
        })

        // Bind to the error event
        req.on('error', function(e){
            twilioCallbackError(e)
        })

        // Add the payload
        req.write(stringPayload)

        //End the request
        req.end()

    } else {
        twilioCallbackError('Given Parameters were missing or invalid')
    }
}

/**************************************************
 *              DOTENVREADER
 * ********************************************* */

helpers.dotEnvReader = function(){

fs.open(__dirname + '/../.env', 'r', function(err, fd){
    if (!err) {
      fs.readFile(fd, 'utf8', function(err, data){
        if (!err && data && data.length > 0) {
            const arrayData = [...data]
            const objLines = {}
            let numEtiqueta = 1
            objLines.line1=[]
            arrayData.forEach(char => {
                if (char !== '\n' && char !== '\r') {
                    objLines[`line${numEtiqueta}`].push(char)
                } 
                if (char === '\r') {
                    numEtiqueta++
                    objLines[`line${numEtiqueta}`]=[]
                }
            })

            Object.keys(objLines).forEach(line => {
                const index = objLines[line].indexOf('=')
                const stringLine = objLines[line].join("")
                const varName = stringLine.slice(0,index)
                const varValue = stringLine.slice(index+1, arrayData.length)
                helpers.privateKeys[varName]=varValue
            })    
        } else {
          console.log('no se leyo bien el .env');
        }
      })
    } else {
      console.log('no pude abrir .env');
    }
  })
  
}

helpers.privateKeys = {}
// Export the module
module.exports = helpers