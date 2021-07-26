/**
 * Request handlers
 *
 */

//Dependencies
const _data = require("../lib/data");
const helpers = require("../lib/helpers");

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
//Required data: firstName, lastName, phone, password, tosAgreement
//Optional data: none
handler._users.post = function (data, callback) {
  //Check that all required fields are filled out
  const firstName =
    typeof data.payload.firstName == "string" &&
    data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName == "string" &&
    data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phone =
    typeof data.payload.phone == "string" &&
    data.payload.phone.trim().length === 10 // check this line to integrate a universal use of phone numbers
      ? data.payload.phone.trim()
      : false;
  const password =
    typeof data.payload.password == "string" &&
    data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement == "boolean" &&
    data.payload.tosAgreement === true;

  if (firstName && lastName && password && phone && tosAgreement) {
    //Make sure that the user doesnt already exist
    _data.read("users", phone, function (err, data) {
      if (err) {
        // Hash the password
        const hashedPasswor = helpers.hash(password);
        if (hashedPasswor) {
          // create the user Object
          const userObject = {
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            hashedPassword: hashedPasswor,
            tosAgreement: true,
          };

          // store the user
          _data.create("users", phone, userObject, function (err) {
            if (!err) {
              callback(200);
            } else {
              console.error(err);
              callback(400, { Error: "Could not create the nue user" });
            }
          });
        } else {
          callback(500, {'Error': 'Could not hash the users password'})
        }
      } else {
        callback(400, { Error: "User already exist" });
      }
    });
  } else {
    callback(400, { Error: "Missing required fields" });
  }
};
//users-get
handler._users.get = function (data, callback) {console.log('entro en el users get');};
//users-put
handler._users.put = function (data, callback) {};
//users-delete
handler._users.delete = function (data, callback) {};

// we define a router to choose which handler will handle which url req
const router = {
  ping: handler.ping,
  users: handler.users,
  notFound: handler.notFound,
};
//
module.exports = router;
