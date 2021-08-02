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

// VERIFY EMAIL
helpers.verifyEmail = function(email, callback){
    const requestDetails = {
        'protocol': 'https:',
        'hostname': 'emailvalidation.abstractapi.com',
        'method': 'GET',
        'path': `/v1/?api_key=${process.env.MAIL_KEY}&email=${email}`,
    }
    // Instantiate the request object
    const req = https.request(requestDetails, function(res){
        //Grab the status of the sent request
        const status = res.statusCode
        let data = ''
        // Callback succesfully if the request went through
        if(status == 200 || status == 201 ){
            res.on('data', function(chunk){
              data+=chunk
            })

            res.on('end', function(){
              const finalObject = JSON.parse(data)
              if (finalObject.deliverability === "DELIVERABLE") {
                  callback(true)
                  console.log('Email Verified');
              } else {
                  callback(false)
                  console.log('Email is not OK');
              }
            })
        }else{
            console.log('Status code returned was: '+status)
        }
    })

    // Bind to the error event
    req.on('error', function(e){
        console.error(e);
    })

    //End the request
    req.end()
}

// helper para parsear un numero (0,999) a string
helpers.createOrderId = function(stringNumber){
    const newOrderId = parseInt(stringNumber, 10) +1
    if(newOrderId <10){
        return `000${newOrderId}`
    }
    if(newOrderId <100 && newOrderId >9){
        return `00${newOrderId}`
    }
    if(newOrderId <1000 && newOrderId >99){
        return `0${newOrderId}`
    }
    if(newOrderId === 1000){
        return '1000'
    }
    if(newOrderId > 1000){
        const resto = newOrderId % 1000
        return `000${resto}`
    }
    if(newOrderId<=0){
        return '0000'
    }

}
// Export the module
module.exports = helpers