//defining CONST handler and route
const handler = {};

handler.sample = function (data, callback) {
  // calback a status code and a payload
  callback(406, { name: "sanmple handler" });
};

handler.notFound = function (data, callback) {
  // callback a status code 404 and maybe a payload
  callback(404);
};

// we define a router to choose which handler will handle which url req
const router = {
  sample: handler.sample,
  notFound: handler.notFound
};
//
module.exports = router