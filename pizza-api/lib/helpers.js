/**
 * Helpers for various tasks
 */
// Dependencies
const crypto = require('crypto')
const config = require('../config')
const https = require('https')
const querystring = require('querystring')
const _data = require('./data')

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

//CHECKOUT PAYMENT WITH STRIPE
helpers.stripePayment = function(amount, orderID,shoppingCart, callback, dataCreateCallback, email, dataUpdateCallback, dataReadCallback){
    
    const payload ={
        amount:amount,
        currency:'usd',
        source:'tok_visa',
        description:'Order for ' + orderID
    }
    
    const stringPayload = querystring.stringify(payload)

    const requestDetails = {
        'protocol': 'https:',
        'hostname': 'api.stripe.com',
        'method': 'POST',
        'path': `/v1/charges`,
        'auth': process.env.STRIPE_KEY,
        'headers':{
            'Content-Type':'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(stringPayload)
        }
    }
    // Instantiate the request object
    const req = https.request(requestDetails ,function(res){
        //Grab the status of the sent request
        const status = res.statusCode
        let data = ''
        // Callback succesfully if the request went through
        if(status == 200 || status == 201 ){
            res.on('data', function(chunk){
              data+=chunk
            })

            res.on('end', function(){
                //get the response
              const finalObjectResponse = JSON.parse(data)
              console.log('\x1b[32m%s\x1b[0m','Payment went through, status code: ', status);
                // store the order payment
                const orderObject = {
                    orderID:orderID,
                    shoppingCart: shoppingCart, 
                    statusCode:status, 
                    paymentStatus:finalObjectResponse
                }
              dataCreateCallback('orderId', orderID, orderObject, function(err){
                  if (!err) {
                    console.log('\x1b[32m%s\x1b[0m','OrderId has been stored correctly in folder .data/orderId: ');
                    //lets get the users shoppingcart and 
                    dataReadCallback('users', email,function(err, userData){
                        if (!err && userData) {
                            userData.shoppingCart = []
                        } else {
                            callback(status, {Message:'order number: ' + orderID +' was stored correctly but the users shopping cart hasn´t been cleaned'})
                        }
                    })
                    
                  } else {
                    console.log('\x1b[31m%s\x1b[0m','There was a problem storing the orderId: '+orderID);
                    callback(status, finalObjectResponse)
                  }
              })
            })
        }else{
            console.log('Status code returned was: '+status, res.statusMessage)
            callback(status, {"message":"Something went wrong with the payment"})
        }
    })

    // Bind to the error event
    req.on('error', function(e){
        console.error(e);
        callback(403, {ErrorOnRequest:e})
    })

    //adding payload
    req.write(stringPayload)

    //End the request
    req.end()
}
// Export the module
module.exports = helpers