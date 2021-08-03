/**
 * Its a feature created to automaticly logout users with expired tokens
 * 
 */
// DEPENDENCIES
const _data = require('./data')
const lib = {}

lib.init = function(){
    setInterval(function(){
        lib.cleanExpiredTokens()
    }, 1000*60)
}

// cleaner
lib.cleanExpiredTokens = function(){
    //we get the list of all current logged in
    _data.list('currentlyLoggedIn', function(err, allTokens){
        if (!err && allTokens) {
            allTokens.forEach(token => {
                _data.read('currentlyLoggedIn', token, function(err, tokenData){
                    if (!err && tokenData) {
                        // get the expire time of this token and check is has expired
                        if(tokenData.expires <= Date.now()){
                            //it has expired so we clean it. (get the user a log out, and deleten token in currently logged in)
                            _data.read('users', tokenData.email, function(err, userData){
                                if (!err && userData) {
                                    //log out
                                    if(tokenData.token === userData.sessionToken.token){
                                        userData.lastSession= Date.now()
                                        userData.sessionToken=false
                                    }
                                    _data.update('users', tokenData.email, userData, function(err){
                                        if (!err) {
                                            //now we can delete the token inside currently logged in
                                            _data.delete('currentlyLoggedIn',token, function(err){
                                                if (!err) {
                                                    console.log('\x1b[33m%s\x1b[0m', 'Token from user ', tokenData.email, ' has experied and has been cleaned');
                                                } else {
                                                    console.log('\x1b[31m%s\x1b[0m','There was an error inside loggingWatcher deleting the token inside currentlyLoggedIn , line , error: ', err);  
                                                }
                                            })
                                        } else {
                                            console.log('\x1b[31m%s\x1b[0m','There was an error inside loggingWatcher updating users sessionToken , line , error: ', err);        
                                        }
                                    })
                                } else {
                                    console.log('\x1b[31m%s\x1b[0m','There was an error inside loggingWatcher getting into users data, line , error: ', err);
                                }
                            })

                        }
                    } else {
                        console.log('\x1b[31m%s\x1b[0m','There was an error inside loggingWatcher line , reading the file: ', token);
                    }
                })
            });   
        } else {
            console.log('\x1b[31m%s\x1b[0m','There was an error inside loggingWatcher listing the tokens, line , error: ', err);
        }
    })
}

module.exports = lib