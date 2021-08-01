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
  const name = contractChecker.userName(data.payload.name)
  const address = contractChecker.userName(data.payload.address)
  const streetAddress = contractChecker.userName(data.payload.streetAddress)
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
// Required data: phone
// Optional data: none
handler._users.get = function (data, callback) {
  //Check that the phone number is valid
  const phone = contractChecker.phone(data.queryStringObject.get("phone"))
  if (phone) {
    //Get the token from headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    handler._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Look up the user
        _data.read("users", phone, function (err, data) {
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
          Error: "Missing required field token in headers or token invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};
//users-put
//Required data: phone + 1 optional data
//Optional data: firstName, lastName, password
handler._users.put = function (data, callback) {
  // Check the required fields
  const phone = contractChecker.phone(data.payload.phone)

  // Check for the optional fields
  const firstName = contractChecker.userName(data.payload.firstName)
  const lastName = contractChecker.userName(data.payload.lastName)
  const password = contractChecker.password(data.payload.password)

  if (phone) {
    //Error if no attributes to update
    if (firstName || lastName || password) {
      //Get the token from headers
      const token =
        typeof data.headers.token == "string" ? data.headers.token : false;

      handler._tokens.verifyToken(token, phone, function (tokenIsValid) {
        if (tokenIsValid) {
          // Look up the user
          _data.read("users", phone, function (err, userData) {
            if (!err && userData) {
              if (firstName) {
                userData.firstName = firstName;
              }
              if (lastName) {
                userData.lastName = lastName;
              }
              if (password) {
                userData.hashedPassword = helpers.hash(password);
              }

              // persist new data
              _data.update("users", phone, userData, function (err) {
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
            Error: "Missing required field token in headers or token invalid",
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
// Required data: phone
handler._users.delete = function (data, callback) {
  //Check that the phone number is valid
  const phone = contractChecker.phone(data.queryStringObject.get("phone"))
  if (phone) {
    //Get the token from headers
    const token =
      typeof data.headers.token == "string" ? data.headers.token : false;

    handler._tokens.verifyToken(token, phone, function (tokenIsValid) {
      if (tokenIsValid) {
        // Look up the user
        _data.read("users", phone, function (err, data) {
          if (!err && data) {
            const userChecks = Array.isArray(data.checks) ? data.checks : [];
            _data.delete("users", phone, function (err) {
              if (!err) {
                // Delete Checks
                if (userChecks.length > 0) {
                  let deletedChecksCountDown = userChecks.length;
                  let deletionErrors = false;
                  userChecks.forEach((id) => {
                    //Delete by id
                    _data.delete("checks", id, function (err) {
                      if (!err) {
                        deletedChecksCountDown = deletedChecksCountDown - 1;
                      } else {
                        deletionErrors = true;
                      }
                      if (!deletionErrors && deletedChecksCountDown === 0) {
                        callback(200);
                      } 
                      if (deletionErrors && deletedChecksCountDown === 0){
                        callback(500, {
                          Error: "Not all checks of the user, were deleted",
                        });
                      }
                    });
                  });
                } else {
                  callback(200);
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
          Error: "Missing required field token in headers or token invalid",
        });
      }
    });
  } else {
    callback(400, { Error: "Missing required field" });
  }
};

//************************************************
// TOKENS
//********************************************* */

handler.tokens = function (data, callback) {
  //figure out which methods to trigger
  const acceptableMethods = ["post", "get", "put", "delete"];
  if (acceptableMethods.includes(data.method)) {
    handler._tokens[data.method](data, callback);
  } else {
    callback(405); // the method is not acceptable
  }
};

// handler._tokens is a container of private methods that should be hidden for everybody, but available for the main methods handler.tokens
handler._tokens = {};

// tokens-post
//Required data: phone, password
//Optional data: none
handler._tokens.post = function (data, callback) {
  //Check that all required fields are filled out
  const phone = contractChecker.phone(data.payload.phone)
  const password = contractChecker.password(data.payload.password)

  if (password && phone) {
    //Make sure that the user doesnt already exist
    _data.read("users", phone, function (err, userData) {
      if (!err && userData) {
        // Hash the password
        const hashedPasswor = helpers.hash(password);
        if (hashedPasswor === userData.hashedPassword) {
          // create a new token with a random name and an expiration of 1 hour
          const tokenID = helpers.createRandomString(20);
          const expires = Date.now() + 1000 * 60 * 60;

          const tokenObject = {
            phone: phone,
            id: tokenID,
            expires: expires,
          };

          //Store the token
          _data.create("tokens", tokenID, tokenObject, function (err) {
            if (!err) {
              callback(200, tokenObject);
            } else {
              callback(500, { Error: "Could not create the token" });
            }
          });
        } else {
          callback(400, {
            Error: "Password did not match specified user password"
          });
        }
      } else {
        console.log(userData);
        callback(400, { Error: "Could not find specified user", err });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};
// tokens-get
// Required data: id
// Optional data: none
handler._tokens.get = function (data, callback) {
  //Check that the id is valid
  const id = contractChecker.token(data.queryStringObject.get("id"))

  if (id) {
    // Look up the token
    _data.read("tokens", id, function (err, tokenData) {
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
//Required data: id, extend
//Optional data: none
handler._tokens.put = function (data, callback) {
  //Check that the id is valid
  const id = contractChecker.token(data.payload.id)

  const extend = data.payload.extend === true;
  // Check for the optional fields
  if (id && extend) {
    // Look up the token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // check that the token is still valid
        if (tokenData.expires > Date.now()) {
          // set the new extension
          tokenData.expires = Date.now() + 1000 * 60 * 60;
          //store the token again
          _data.update("tokens", id, tokenData, function (err) {
            if (!err) {
              callback(200, { Message: "Token valid for 1 more hour" });
            } else {
              callback(500, { Error: "Could not extend the token" });
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
    callback(400, { Error: "Missing required fields or they are invalid" });
  }
};

// tokens-delete
// Required data: id
handler._tokens.delete = function (data, callback) {
  //Check that the id is valid
  const id = contractChecker.token(data.queryStringObject.get("id"))
  
  if (id) {
    // Look up the token
    _data.read("tokens", id, function (err, tokenData) {
      if (!err && tokenData) {
        // delete the file
        _data.delete("tokens", id, function (err) {
          if (!err) {
            callback(200);
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

handler._tokens.verifyToken = function (id, phone, booleanCallback) {
  //look up the token
  _data.read("tokens", id, function (err, tokenData) {
    if (!err && tokenData) {
      //Check if the token is for the current user
      if (tokenData.phone === phone && tokenData.expires > Date.now()) {
        booleanCallback(true);
      } else {
        booleanCallback(false);
      }
    } else {
      booleanCallback(false);
    }
  });
};

module.exports = handler;
