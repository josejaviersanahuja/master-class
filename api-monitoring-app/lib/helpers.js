/**
 * Helpers for various tasks
 */
// Dependencies
const crypto = require('crypto')
const config = require('../config')

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












// Export the module
module.exports = helpers