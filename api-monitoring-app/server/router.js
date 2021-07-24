//defining CONST handler and route
const handler = {};

handler.ping = function (data, callback) {
  // calback a status code and a payload
  callback(200);
};

handler.notFound = function (data, callback) {
  // callback a status code 404 and maybe a payload
  callback(404);
};

handler.hello = function (data, callback) {
  callback(200, {"message":"Welcome to the API of ZITROJJDEV"})
}

// we define a router to choose which handler will handle which url req
const router = {
  'ping': handler.ping,
  'hello':handler.hello,
  'notFound': handler.notFound
};
//
module.exports = router