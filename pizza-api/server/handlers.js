/**
 * Request handlers
 *
 */

//Dependencies
const { type } = require("os");
// const config = require("../config");
const _data = require("../lib/data");
const helpers = require("../lib/helpers");
const contractChecker = require('../lib/objectContractsChecker')
const menuPizzas = require('../.data/menu/menuPizzas.json')
const menuDrinks = require('../.data/menu/menuDrinks.json')

//defining CONST handlers and router
const handler = {};

handler.ping = function (data, callback) {
  // calback a status code and a payload
  callback(200);
};

handler.notFound = function (data, callback) {
  // callback a status code 404 and maybe a payload
  callback(404);
};

handler.users = function (data, callback) {
  //figure out which methods to trigger
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.includes(data.method)) {
    handler._users[data.method](data, callback);
  } else {
    callback(405); // the method is not acceptable
  }
};

// methods like the nextone handler._users is a method that should be hidden for users methods, but available for the main methods handler.users
handler._users = {};

// users-post
//Required data: name, address, street_address, email
//Optional data: none
handler._users.post = function (data, callback) {
  //Check that all required fields are filled out
  const name = contractChecker.notEmptyString(data.payload.name)
  const address = contractChecker.notEmptyString(data.payload.address)
  const streetAddress = contractChecker.notEmptyString(data.payload.streetAddress)
  const password = contractChecker.password(data.payload.password)
  
  if (name &&  address && streetAddress && password) {
    //Make sure that the user doesnt already exist
    const email = data.payload.email
    contractChecker.email(email, function(emailIsValid){
      if (emailIsValid) {
        _data.read("users", email, function (err, data) {
          if (err) {
            // Hash the password
            const hashedPasswor = helpers.hash(password);
            if (hashedPasswor) {
              // create the user Object
              const userObject = {
                name: name,
                email: email,
                address: address,
                hashedPassword: hashedPasswor,
                streetAddress:streetAddress
              };
    
              // store the user
              _data.create("users", email, userObject, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.error(err);
                  callback(400, { Error: "Could not create the nue user" });
                }
              });
            } else {
              callback(500, { Error: "Could not hash the users password" });
            }
          } else {
            callback(400, { Error: "User already exist" });
          }
        });
      } else {
        callback(400, {Error: 'Email is invalid'})
      }
    })
    
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};
//users-get
// Required data: email
// Optional data: none
handler._users.get = function (data, callback) {
  //Check that the phone number is valid
  const email = contractChecker.notEmptyString(data.queryStringObject.get("email"))
  if (email) {
    //Get the loggin token from headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    handler._logging.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Look up the user
        _data.read("users", email, function (err, data) {
          if (!err && data) {
            // removed the hashed password from the user object
            delete data.hashedPassword;
            callback(200, data);
          } else {
            callback(404);
          }
        });
      } else {
        callback(403, {
          Error: "Missing required field, or token in headers, or token invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};
//users-put
//Required data: email + 1 optional data
//Optional data: name, address, streetAddress, password
handler._users.put = function (data, callback) {
  // Check the required fields
  const email = contractChecker.notEmptyString(data.payload.email)

  // Check for the optional fields
  const name = contractChecker.notEmptyString(data.payload.name)
  const address = contractChecker.notEmptyString(data.payload.address)
  const streetAddress = contractChecker.notEmptyString(data.payload.streetAddress)
  const password = contractChecker.password(data.payload.password)

  if (email) {
    //Error if no attributes to update
    if (name || address || streetAddress || password) {
      //Get the token from headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      handler._logging.verifyToken(token, email, function (tokenIsValid) {
        if (tokenIsValid) {
          // Look up the user
          _data.read("users", email, function (err, userData) {
            if (!err && userData) {
              if (name) {
                userData.name = name;
              }
              if (address) {
                userData.address = address;
              }
              if (streetAddress) {
                userData.streetAddress = streetAddress;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              // persist new data
              _data.update("users", email, userData, function (err) {
                if (!err) {
                  callback(200);
                } else {
                  console.error(err);
                  callback(500, { Error: "Could not update the user" });
                }
              });
            } else {
              callback(404, { Error: "Specified User does not exist" });
            }
          });
        } else {
          callback(403, {
            Error: "Missing required field, token in headers, or token invalid",
          });
        }
      });
    } else {
      callback(400, { Error: "Missing fields to update" });
    }
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

//users-delete
// Required data: email
handler._users.delete = function (data, callback) {
  //Check that the phone number is valid
  const email = contractChecker.notEmptyString(data.queryStringObject.get("email"))
  if (email) {
    //Get the token from headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    handler._logging.verifyToken(token, email, function (tokenIsValid) {
      if (tokenIsValid) {
        // Look up the user
        _data.read("users", email, function (err, data) {
          if (!err && data) {
            const userCurrentToken = data.sessionToken.token
            _data.delete("users", email, function (err) {
              if (!err) {
                // Delete currentLoggedIn token
                if (userCurrentToken.length > 0) {
                    //Delete the token
                    _data.delete("currentlyLoggedIn", userCurrentToken, function (err) {
                      if (!err) {
                        callback(200)
                      } else {
                        callback(500, {
                          Error: "couldn´t delete currentlyLoggedIn token",
                        }); 
                      }
                  });
                } else {
                  callback(500, {
                    Error:'The  token is empty, couldn´t find the token file to delete it'
                  })
                }
              } else {
                callback(500, { Error: "Could not delete the specified user" });
              }
            });
          } else {
            callback(404, { Error: "Could not find the specified user" });
          }
        });
      } else {
        callback(403, {
          Error: "Missing required field, token in headers, or token invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

//************************************************
//                logging
//********************************************* */

handler.logging = function (data, callback) {
  //figure out which methods to trigger
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.includes(data.method)) {
    handler._logging[data.method](data, callback);
  } else {
    callback(405); // the method is not acceptable
  }
};

// handler._tokens is a container of private methods that should be hidden for everybody, but available for the main methods handler.tokens
handler._logging = {};

// tokens-post
//Required data: phone, password
//Optional data: none
handler._logging.post = function (data, callback) {
  //Check that all required fields are filled out
  const email = contractChecker.notEmptyString(data.payload.email)
  const password = contractChecker.password(data.payload.password)

  if (password && email) {
    //Make sure that the user already exist
    _data.read("users", email, function (err, userData) {
      if (!err && userData) {
        // Hash the password
        const hashedPasswor = helpers.hash(password);
        if (hashedPasswor === userData.hashedPassword) {
          // create a new token with a random name and an expiration of 1 hour
          const tokenID = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;

          const tokenObject = {
            email: email,
            token: tokenID,
            expires: expires,
          };

          //Store the token en currentlyLoggedIn
          _data.create("currentlyLoggedIn", tokenID, tokenObject, function (err) {
            if (!err) {
               //create the log in session in the user
              userData.sessionToken = {
                token:tokenID,
                expires:expires
              }
              _data.update('users', email, userData, function(err){
                if (!err) {
                  callback(200, {currentlyLoggedIn: tokenObject, user: userData})
                } else {
                  callback(500, {Error: "Problem updating user loggin session"})
                }
              })
            } else {
              callback(500, { Error: "Could not create the login token" });
            }
          });
        } else {
          callback(400, {
            Error: "Password did not match specified user password"
          });
        }
      } else {
        // console.log(userData);
        callback(400, { Error: "Could not find specified user", err });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};
// tokens-get
// Required data: token
// Optional data: none
// @TODO check if this method will be open for everybody or we need to create a security requirement
handler._logging.get = function (data, callback) {
  //Check that the id is valid
  const token = contractChecker.token(data.queryStringObject.get("token"))

  if (token) {
    // Look up the token
    _data.read("currentlyLoggedIn", token, function (err, tokenData) {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { Error: "did not find that token" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};
//tokens-put
//Required data: token, extend
//Optional data: none
// @TODO check if this method will be open for everybody or we need to create a security requirement
handler._logging.put = function (data, callback) {
  //Check that the id is valid
  const token = contractChecker.token(data.payload.token)

  const extend = data.payload.extend === true;
  // Check for the optional fields
  if (token && extend) {
    // Look up the token
    _data.read("currentlyLoggedIn", token, function (err, tokenData) {
      if (!err && tokenData) {
        // check that the token is still valid
        if (tokenData.expires > Date.now()) {
          // set the new extension
           const newExpire= Date.now() + 1000 * 60 * 60;
           tokenData.expires =newExpire
          //store the token again
          _data.update("currentlyLoggedIn", token, tokenData, function (err) {
            if (!err) {
              _data.read("users", tokenData.email, function(err, userData){
                if (!err && userData) {
                  userData.sessionToken.expires=newExpire
                  _data.update("users", tokenData.email, userData, function(err){
                    if (!err) {
                      callback(200, {message:'Session extended for 1 more hour'})
                    } else {
                      callback(500, {Error:'Could not update the extended session in users'})
                    }
                  })
                } else {
                  callback(500, {Error:'Could not get into the users data to extend the token'})
                }
              })
            } else {
              callback(500, { Error: "Could not extend the token in currentlyLoggedIn folder" });
            }
          });
        } else {
          callback(400, {
            Error: "The token has already expired and can´t be extended",
          });
        }
      } else {
        callback(400, { Error: "That token does not exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields, or they are invalid" });
  }
};

// logging-delete (equivalent to log out)
// Required data: token
//@TODO watcher to log out automaticly when timeout
handler._logging.delete = function (data, callback) {
  //Check that the id is valid
  const token = contractChecker.token(data.queryStringObject.get("token"))
  
  if (token) {
    // Look up the token
    _data.read("currentlyLoggedIn", token, function (err, tokenData) {
      if (!err && tokenData) {
        // delete the file
        const email = tokenData.email
        _data.delete("currentlyLoggedIn", token, function (err) {
          if (!err) {
            _data.read('users', email, function(err, userData){
              if (!err && userData) {
                userData.lastSession = Date.now()
                userData.sessionToken = false
                _data.update('users', email, userData, function(err){
                  if (!err) {
                    callback(200)
                  } else {
                    callback(500, {Error:'Couldn´t update the user data logging information'})
                  }
                })
              } else {
                callback(500, {Error:'Couldn´t get into the user´s data to change users loggin information'})
              }
            })
          } else {
            callback(500, { Error: "Could not delete the specified token" });
          }
        });
      } else {
        callback(404, { Error: "Could not find the specified token" });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

// requires: token, email
// This method verifies if the user with the email is currently logged in
handler._logging.verifyToken = function (id, email, booleanCallback) {
  //look up the token
  _data.read("currentlyLoggedIn", id, function (err, tokenData) {
    if (!err && tokenData) {
      //Check if the token is for the current user
      if (tokenData.email === email && tokenData.expires > Date.now()) {
        booleanCallback(true);
      } else {
        booleanCallback(false);
      }
    } else {
      booleanCallback(false);
    }
  });
};

//************************************************
//                Menu
//********************************************* */

// data required: email and a sessionToken (only a logged in user)
handler.menu = function (data, callback) {
  //figure out which methods to trigger
  const acceptableMethods = ["get"];
  if (acceptableMethods.includes(data.method)) {
    // check entry data
    const email = contractChecker.notEmptyString(data.queryStringObject.get('email'))
    const token = contractChecker.token(data.queryStringObject.get('token'))
    if (email && token) {
      //Check if the user is logged in
      handler._logging.verifyToken(token, email, function(isLoggedIn){
        if (isLoggedIn) {
          //return the menu, so user can check it
          callback(200, {menuPizzas, menuDrinks})
        } else {
          callback(400, {Error:'user or token not found, or user is not logged in. please log in and repeat the request'})
        }
      })
    } else {
      callback(400,{Error:'Bad request. Parameters didn´t filled contract requirement'})
    }
    
  } else {
    callback(405, {Error:'This endpoint only accepts GET method'}); // the method is not acceptable
  }
};

//************************************************
//                shoppingCart
//********************************************* */
handler.shoppingcart = function (data, callback) {
  //figure out which methods to trigger
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.includes(data.method)) {
    handler._shoppingcart[data.method](data, callback);
  } else {
    callback(405); // the method is not acceptable
  }
};

//
handler._shoppingcart={}
//require headers: token
//require data: valid Item id, valid size, email
//optional data: note i.e. : 'i don´t want pineapples in my hawaian pizza'
handler._shoppingcart.post = function(data,callback){
  const item = contractChecker.shoppingItemId(data.payload.item)
  const size = contractChecker.shoppingItemSize(data.payload.size)
  const note = contractChecker.notEmptyString(data.payload.note)
  const buyableObject = contractChecker.shoppingObject(item, size, note)
  const email = contractChecker.notEmptyString(data.payload.email)
  const token = contractChecker.token(data.headers.token)
  // simple check if payload was sent
  if (item && size) {
    // complex check if the payload item+size exists
    if (buyableObject) {
      //simple check if email an token was sent
      if (email && token) {
        //complex check if the user is logged in
        handler._logging.verifyToken(token,email, function(isValidToken){
          if (isValidToken) {
             buyableObject.date = Date.now()
            _data.read('users', email, function(err, userData){
              if (!err && userData) {
                // now that we have the user we add the product to user´s shopping cart
                const shoppingCart = Array.isArray(userData.shoppingCart) ? [...userData.shoppingCart] : []
                shoppingCart.push(buyableObject)
                userData.shoppingCart = shoppingCart
                _data.update('users', email, userData, function(err){
                  if (!err) {
                    callback(200, buyableObject)
                  } else {
                    callback(500,{Error:'Failed adding the product to the shoppingCart'})
                  }
                })
              } else {
                callback(500,{Error:'Couldn´t open the user´s data'})
              }
            })                              
          } else {
            callback(403,{Error:'log in again as login token is not valid'})
          }
        }) 
      } else {
        callback(400, {Error:'no email, or token doesn´t fill the format, or missing token'})
      }
    } else {
      callback(400, {Error:'The item´s size doen´t exist in the menu'})
    }
  } else {
    callback(400, {Error:'The item doesn´t exist, or the size doesn´t exist, '})
  }
}

//shoppingcart get
//required data: email
//headers.token (logged in user)
handler._shoppingcart.get = function(data, callback){
  // normal requirement checker
  const email = contractChecker.notEmptyString(data.queryStringObject.get('email'))
  const token = contractChecker.token(data.headers.token)
  
  if (email && token) {
    //stronger check if user is logged in
    handler._logging.verifyToken(token, email, function(isValidToken){
      if (isValidToken) {
        _data.read('users', email, function(err, userData){
          if (!err && userData) {
            if (Array.isArray(userData.shoppingCart)) {
              callback(200, userData.shoppingCart)
            } else {
              userData.shoppingCart=[]
              callback(200, userData.shoppingCart)
            }
          } else {
            callback(500,{Error:'Couldn´t read user´s data'})
          }
        })
      } else {
        callback(400,{Error:'user is not correctly logged in, or token expired. Log in and try again'})
      }
    })
  } else {
    callback(400,{Error:'email and login token didn´t pass the contract, or token is missing in headers'})
  }
}

//shoppingCart delete the whole cart
// as get, just receives email and token
handler._shoppingcart.delete = function(data, callback){
  const email = contractChecker.notEmptyString(data.queryStringObject.get('email'))
  const token = contractChecker.token(data.headers.token)
  //simple check
  if (email&&token) {
    //check if user is logged in correctly
    handler._logging.verifyToken(token, email, function(isValidToken){
      if (isValidToken) {
        _data.read('users', email, function(err, userData){
          if (!err && userData) {
            userData.shoppingCart=[]
            _data.update('users', email, userData, function(err){
              if (!err) {
                callback(200, {message:'shopping cart is now empty'})
              } else {
                callback(500, {Error:'during empting the shopping cart'})
              }
            })
          } else {
            callback(500,{Error:'reading users data.'})
          }
        })
      } else {
        callback(400,{Error:'User is not logged in correctly or token has expired'})
      }
    })
  } else {
    callback(400,{Error:'email and login token didn´t pass the contract check, or token missing in headers'})
  }
}
//Export module
module.exports = handler;

/**
 * //create the order id
            //@TODO create order watcher for the kitchen
            _data.list('orderID',function(err, orderList){
              if (!err) {
                // if its the first order, the id will be 0001
                let orderId =''
                if (orderList.length===0) {
                  orderId = '0001'
                } else {
                  // if its not the first order the id will be the previous +1
                  const lastOrderId = orderList[orderList.length-1]
                  orderId = helpers.createOrderId(lastOrderId)  
                }
                _data.create('orderID', orderId, buyableObject, function(err){
                  if (!err) {
                    //we continue with the user
                  } else {

                  }
                })
              } else {

              }
            })
 */