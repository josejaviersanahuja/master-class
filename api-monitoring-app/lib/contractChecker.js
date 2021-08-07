/**
 * CHECKING THE TYPE OF A VARIABLE
 * generates a lot of repetitive code.
 * this file will gather this checks
 * 
 */

// creating the module object
const lib = {}

// NOTEMPTYSTRING: check if a variable is a not empty string.
lib.notEmptyString = function(str){
    if (typeof str == 'string' && str.length > 0) {
        return str
    } else {
        return false
    }
}

// OBJECT: if data is an object, return data if not an empty object {}
lib.object = function(data){
    if (typeof data == 'object' && data !== null) {
        return data
    } else {
        return {}
    }
}
// exporting the module object
module.exports = lib