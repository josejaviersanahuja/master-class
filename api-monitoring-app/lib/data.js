/**
 * FILE for storing and editing DATA
 */

const fs = require('fs')
const path = require('path')

// CONTAINER

const lib = {}

// BASE DIRRECTORY of the data folder
lib.baseDir = path.join(__dirname, '/../.data/')

lib.create= function(dir, file, data, callback) {
    // Open the file for writing
    fs.open(lib.baseDir + dir +'/'+ file + '.json', 'wx', function(err, fileDescriptor) {
        if (!err && fileDescriptor) {
            //  CONVERT DATA TO STRING
            const stringData = JSON.stringify(data)

            //WRITE AND CLOSE FILE
            fs.writeFile(fileDescriptor, stringData, function(err){
                if(!err){
                    fs.close(fileDescriptor, function(err){
                        if(!err){
                            callback(false)
                        }else{
                            callback("Error closing new file")
                        }
                    })
                } else {
                    callback('Error writing to new file')
                }
            })
        } else {
            callback('Could not create new file, it may already exist')
        }
    })
}

// READ DATA from a file
lib.read= function(dir, file,callback) {
    fs.readFile(lib.baseDir+ dir + '/' + file + '.json', 'utf8', function(err, data){
        callback(err, data)
    })
}

// UPDATE DATA FROM AN EXISTING FILE

lib.update = function (dir, file, data, callbak){
    
}



// export it

module.exports = lib