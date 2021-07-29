/**
 * Library for storing and rotating logs into files
 * 
 */

//Dependencies
const fs = require('fs')
const path = require('path')
const zlib = require('zlib')

//Create exportable object module
const lib = {}

//Make directory constant baseDir
lib.baseDir = path.join(__dirname, '/../.logs/')

//Append a string to a file. Create the file if it doesn´t exist
lib.append = function(file, str, errorCallback) {
    //Open the file for appending
    fs.open(lib.baseDir+ file + '.log', 'a', function(err, fileDescriptor){
        if (!err && fileDescriptor) {
            //Append the str
            fs.appendFile(fileDescriptor, str, function(err){
                if (!err) {
                    fs.close(fileDescriptor, function(err){
                        if (!err) {
                            errorCallback(false)
                        } else {
                            errorCallback('Error closing the file that was appended')
                        }
                    })
                } else {
                    errorCallback('Error appending the file')
                }
            } )
        } else {
            errorCallback('Could not open file for appending')
        }
    })
}

// Export module
module.exports = lib