/**
 * This module will deal with the verifications of the contracts of the objects.
 * 
 */
//Dependencies
const util = require('util')
const https = require('https')
const debug = util.debuglog('objectContractsChecker')

//Creating module object
const lib = {}

// Check NAMES
// receives a name and checks that is string and not empty
lib.userName =  function(rawUserName){
    if (typeof rawUserName == "string" &&
    rawUserName.trim().length > 0) {
        return rawUserName.trim()
    } else {
        debug('The name didn´t fulfiled the contract');
        return false
    }
}

// Check Passwords
// receives a password and checks that is a string a longer than 3 chars
lib.password =  function(rawPassword){
    if (typeof rawPassword == "string" &&
    rawPassword.trim().length > 3) {
        return rawPassword.trim()
    } else {
        debug('The password didn´t fulfiled the contract');
        return false
    }
}

// Check phone
// receives a phoneNumber string and checks that is string and its length is 11
lib.phone =  function(rawPhone){
    if (typeof rawPhone == "string" &&
    rawPhone.trim().length === 11) {
        return rawPhone.trim()
    } else {
        debug('The phone number didn´t fulfiled the contract');
        return false
    }
}

// Check Token
// receives a token string and checks that is string and its length is 20
lib.token =  function(rawToken){
    if (typeof rawToken == "string" &&
    rawToken.trim().length === 20) {
        return rawToken.trim()
    } else {
        debug('The token didn´t fulfiled the contract');
        return false
    }
}

// Check TosAgreement
lib.TosAgreement = function(rawBoolean){
    if (typeof(rawBoolean) == 'boolean' && rawBoolean===true) {
     return true   
    } else {
        debug('The TosAgreement didn´t filled the contract')
        return false
    }
}

// Check EMAIL
// VERIFY EMAIL this time is asynchronos
lib.email = function(email, callback){
    
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
//Exporting module
module.exports = lib