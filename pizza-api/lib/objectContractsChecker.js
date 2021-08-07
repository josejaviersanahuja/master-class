/**
 * This module will deal with the verifications of the contracts of the objects.
 * 
 */
//Dependencies
const util = require('util')
const https = require('https')
const debug = util.debuglog('objectContractsChecker')
const menuPizzas = require('../.data/menu/menuPizzas.json')
const menuDrinks = require('../.data/menu/menuDrinks.json')

//Creating module object
const lib = {}

// Check NAMES
// receives a name and checks that is string and not empty
lib.notEmptyString =  function(data){
    if (typeof data == "string" &&
    data.trim().length > 0) {
        return data.trim()
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
                  callback(true, false)
                  debug('Email Verified');
              } else {
                  callback(false, false)
                  debug('Email is not OK');
              }
            })
        }else{
            if(status===500){
                callback(false, true)
            } else {
                console.log('Verify email validation API. it´s returning status code: '+ status);
            }
            debug('Status code returned was: '+status)
        }
    })

    // Bind to the error event
    req.on('error', function(e){
        console.error(e);
    })

    //End the request
    req.end()
}

//Item validation for shopping cart
// constants
//allProductsId= [ 'margarita', 'hawaian', 'american', 'coke', '7up', 'water', 'beer' ]
const allProductsId = Object.keys(menuPizzas).concat(Object.keys(menuDrinks))
const allSizes =["small", "medium", "large"]
const allProducts ={
    ...menuDrinks,
    ...menuPizzas
}
// check if the item exists in the menu
lib.shoppingItemId = function(item){
    if (typeof item == 'string') {
        if (allProductsId.includes(item.toLowerCase())) {
            return item.toLowerCase()
        } else {
            debug('The item doesn´t exist or is spelled wrongly');
            return false
        }
    } else {
        return false
    }
}
// check if the size comply the format
// pending to check if this size exists for certain item.
lib.shoppingItemSize = function(size){
    if (typeof size == 'string') {
        if (allSizes.includes(size.toLowerCase())) {
            return size.toLowerCase()
        } else {
            debug('The size doesn´t exist or is spelled wrongly');
            return false
        }
    } else {
        return false
    }
}
//check if the whole object exist
lib.shoppingObject = function(item, size, note=false){
    //console.log(allProducts[item].size[size],'en shopping Object creator');
    if (typeof (allProducts[item].size[size]) == 'object' && allProducts[item].size[size].price) {
        if (note) {
            const finalObject = {
                id:item,
                size:size,
                price:allProducts[item].size[size].price,
                note:note
            }
            return finalObject
        } else {
            const finalObject = {
                id:item,
                size:size,
                price:allProducts[item].size[size].price
            }
            return finalObject
        }
    } else {
        return false
    }
}

//check if a shopping cart is valid
lib.shoppingCart = function(shoppingCart){
    // 4 conditions. 1 must be an array, 2 every element must be an object, 3 every object must have a key (price) and must be a number 
    if (Array.isArray(shoppingCart)) {
        let isShoppingCartValid = true && shoppingCart.length > 0 
        shoppingCart.forEach(item => {
            isShoppingCartValid = isShoppingCartValid && typeof(item)=='object' && typeof(item.price)=='number'
        })
        if (isShoppingCartValid) {
            return shoppingCart
        } else {
            return false
        }
    } else {
        return false
    }
}
//check if a string is a number, is an int and not negative, or a number is all that
lib.numString = function(num){
    const numString = num.toString()
   var valoresAceptados = /^[0-9]+$/;
       if (numString.match(valoresAceptados)){
          return parseInt(numString)
       } else {
         debug('este string no es un numero')
         // 0 is an acceptable index value. if we check if(index) and the value is 0, it will return false
         // IMPORTANT the good check is : if(idex>=0)
         return -1
      }
}
//Exporting module
module.exports = lib