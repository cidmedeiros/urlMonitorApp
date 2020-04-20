/* 
Hub for all the handlers
 */

 //Dependencies
 const schreiber = require('./schreiber');
 const tools = require('./tools');
 const config = require('./config');
//Define the handlers
var handlers = {};

//Index Handler
handlers.index = (data, callback) => {
    if(data.method == 'get'){
        //Prepate data for interpolation
        let templateData = {
            'head.title' : 'Uptime Monitoring - Made Simple',
            'head.description': 'We offer free, simple uptime monitoring for HTTP/HTTPS sites of all kinds.',
            'body.class': 'index'
        }
        //Read in a template as a string
        tools.getTemplate('index', templateData,(err, str) =>{
            if(!err && str){
                tools.addUniversalTemplates(str, templateData, (err, fullString) => {
                    if(!err && fullString){
                        callback(200, fullString, 'html');
                    } else {
                        callback(500, undefined, 'html');
                    }
                });
            } else {
                callback(500, undefined, 'html');
            }
        });
    } else {
        callback(405, undefined, 'html');
    }
};

/*
    **HTML API HANDLERS
 */

 // Create Account
handlers.accountCreate = (data,callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Create an Account',
        'head.description' : 'Signup is easy and only takes a few seconds.',
        'body.class' : 'accountCreate'
      };
      // Read in a template as a string
      tools.getTemplate('accountCreate',templateData, (err,str)=> {
        if(!err && str){
          // Add the universal header and footer
          tools.addUniversalTemplates(str,templateData, (err,str) => {
            if(!err && str){
              // Return that page as HTML
              callback(200,str,'html');
            } else {
              callback(500,undefined,'html');
            }
          });
        } else {
          callback(500,undefined,'html');
        }
      });
    } else {
      callback(405,undefined,'html');
    }
};

//Route to get icons
handlers.favicon = (data, callback) => {
    //Reject any request that isn't a GET
    if(data.method == 'get'){
        //Read in favicon data
        tools.getStaticAsset('favicon.ico', (err, data) => {
            if(!err && data){
                callback(200, data, 'favicon');
            } else {
                callback(500);
            }
        });
    } else {
        callback(405);
    }
};

//Public assets
handlers.public = (data, callback) => {
    //Reject any request that isn't a GET
    if(data.method == 'get'){
        //Get the file name being requested
        let trimmedAssetName = data.trimmedPath.replace('public/', '').trim();
        if(trimmedAssetName.length > 0){
            //Read in the asset's data
            tools.getStaticAsset(trimmedAssetName, (err, data) => {
                if(!err && data){
                    //Determine the content type (default to plain text)
                    let contentType = 'plain';
                    if(trimmedAssetName.indexOf('.css') > -1){
                        contentType = 'css';
                    }
                    if(trimmedAssetName.indexOf('.png') > -1){
                        contentType = 'png';
                    }
                    if(trimmedAssetName.indexOf('.jpg') > -1){
                        contentType = 'jpg';
                    }
                    if(trimmedAssetName.indexOf('.ico') > -1){
                        contentType = 'favicon';
                    }
                    callback(200, data, contentType);
                } else {
                    callback(404);
                }
            });
        }
    } else {
        callback(405);
    }
};

/*
    **JSON API HANDLERS
 */
//Users
handlers.users = (data, callback) => {
    const acceptableMethods = ['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._users[data.method](data, callback);
    } else{
        callback(405);
    }
};

//SubContainer for handler.uses subMethods
handlers._users = {};

//Define users post submethod
handlers._users.post = (data, callback) => {
    /* Required Data: firstName, lastName, phone, password, tosAgreement
       Optional Data: none
       Data must come in as a json parsed object */
    //check if all required data are filled out
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;
    console.log(firstName,lastName,phone,password,tosAgreement);
    if(firstName && lastName && phone && password && tosAgreement){
        //Make sure the user doesn't already exists
        schreiber.read('users', phone, (err, data) => {
            console.log('entra schreiber');
            console.log(data);
            console.log(err);
            if(err){
                //Hash the users password
                const hashedPass = tools.hash(password);
                //Before proceed check if hashing was successful
                if(hashedPass){
                    let UserObjct = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'phone': phone,
                        'password' : hashedPass,
                        'tosAgreement': true
                    }
                    //Save User file
                    schreiber.create('users', phone, UserObjct, (err) => {
                        if(!err || err == 200){
                            callback(200);
                        } else {
                            callback(500, err);
                        }
                    });
                } else {
                    callback(500, {'Error':'Could not hash the use\'s password!'})
                }
            } else {
                console.log(400, {'Error': err});
                callback(400, {'Error': 'A user with that phone number already exists.'})
            }
        });
    } else {
        callback(400, {'Error':'Missing required information'});
    }
};

//Define users get submethod
handlers._users.get = (data, callback) => {
    /* Required data: phone
       optional data: none
     */
    //check valid phone
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //Verify if a given token id is currently valid
        if(token){
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if(tokenIsValid){
                    schreiber.read('users', phone, (err, Userdata) => {
                        if(!err && Userdata){
                            //Do not provide the hashed password to the wild
                            delete Userdata.password;
                            callback(200, Userdata);
                        } else {
                            callback(404);
                        }
                    });
                } else {
                    callback(403, {'Error': 'Either the user does not exist, or the token is/has invalid/expired!'});
                }
            });
        } else {
            callback(403, {'Error': 'Missing token in header, or token is invalid!'});
        }
    } else {
        callback(400, 'Missing or invalid required field!');
    }
};

//Define users put submethod
handlers._users.put = (data, callback) => {
    /* Required data: phone && at least one optional data
    optional data: firstName, lastName, password (at least one must be specified)
    */

    //Check valid phone
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

    // Check for the optional & password fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone){
        //Error if nothing is sent to update
        if(firstName || lastName || password){
            //Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            if(token){
                //Verify if a given token id is currently valid
                handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                    if(tokenIsValid){
                        schreiber.read('users', phone, (err, userData) => {
                            if(!err && userData){
                                //Update fields necessary
                                if(firstName){
                                    userData.firstName = firstName;
                                }
                                if(lastName){
                                    userData.lastName = lastName;
                                }
                                if(password){
                                    userData.password = tools.hash(password);
                                }
                                //Store the new updates
                                schreiber.update('users', phone, userData, (err) =>{
                                    if(!err || err == 200){
                                        callback(200, {'Message': 'update successful!'});
                                    } else {
                                        callback(500, {'Error': err});
                                    }
                                });
                            } else{
                                callback(400, {'Error':'The specified user does not exist!'})
                            }
                        });
                    } else {
                        callback(403, {'Error': 'Either the user does not exist, or the token is/has invalid/expired!'});
                    }
                });
            } else {
                callback(403, {'Error': 'Missing token in header, or token is invalid!'})
            }
        } else {
            callback(400, {'Error':'Missing some required fields to update'})
        }
    } else {
        callback(400, {'Error':'The provided phone number is invalid!'})
    }
};

//Define users delete submethod
handlers._users.delete = (data, callback) => {
    /* Required data: phone
       optional data: none
     */
    //check valid phone
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        if(token){
            //Verify if a given token id is currently valid
            handlers._tokens.verifyToken(token, phone, (tokenIsValid) => {
                if(tokenIsValid){
                    schreiber.read('users', phone, (err, userData) => {
                        if(!err && userData){
                            schreiber.delete('users', phone, (err) => {
                                if(!err || err == 200){
                                    //delete all data associated to the user
                                    //verify user's checks
                                    let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                    let checksToDelete = userChecks.length;
                                    if(checksToDelete > 0){
                                        let checksDeleted = 0;
                                        let deletionsError = false;
                                        //loop through the checks
                                        userChecks.forEach(checkId => {
                                            schreiber.delete('checks', checkId, (err) =>{
                                                if(err && err != 200){
                                                    deletionsError = true;
                                                }
                                                checksDeleted++;
                                                if(checksToDelete == checksDeleted){
                                                    if(!deletionsError){
                                                        callback(200);
                                                    } else {
                                                        callback(500, {'Error': 'One or more of the user\'s check could not be deleted. Some of them might not exist already.'});
                                                    }
                                                }
                                            });
                                        });
                                    } else {
                                        callback(200);
                                    }
                                } else{
                                    callback(500, {'Error': 'Could not delete user!'});
                                }
                            });
                        } else {
                            callback(404, {'Error': 'Could not find the specified user!'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Either the user does not exist, or the token is/has invalid/expired!'});
                }
            });
        } else {
            callback(403, {'Error': 'Missing token in header, or token is invalid!'});
        }
    } else {
        callback(404, {'Error':'Missing or invalid required field!'});
    }
};

//Tokens
handlers.tokens = (data, callback) => {
    const acceptableMethods = ['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._tokens[data.method](data, callback);
    } else{
        callback(405);
    }
};

//SubContainer for handler.tokens subMethods
handlers._tokens = {};

//Define tokens post submethod
handlers._tokens.post = (data, callback) => {
    /* Required Data: phone, password
       Optional Data: none
       Data must come in as a json parsed object */
    //check if all required data are filled out
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(phone && password){
        //Lookup the user who matches that phone number 
        schreiber.read('users', phone, (err, userData) => {
            if(!err && userData){
                //Hash the sent password and compare it with stored one
                var hashedPass = tools.hash(password);
                if(hashedPass == userData.password){
                    let tokenId = tools.createRandomString(20); 
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'phone' : phone,
                        'id' : tokenId,
                        'expires': expires
                    };
                    //Store the token
                    schreiber.create('tokens', tokenId, tokenObject, (err) => {
                        if(!err || err == 200){
                            callback(200, tokenObject);
                        } else {
                            callback(500, {'message':'Error creating the token!'});
                        }
                    })
                } else {
                    callback(400, {'Error':'The password did not match!'});
                }
            } else{
                callback(404, {'Error':'Could not find the specified user'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required field(s)'});
    }
};

//Define tokens get submethod
handlers._tokens.get = (data, callback) => {
    /* Required data: id
       optional data: none
     */
    //check valid id
    const id = typeof(data.queryStringObject.id) == 'string' ? data.queryStringObject.id.trim() : false;

    if(id){
        schreiber.read('tokens', id, (err, tokenData) => {
            if(!err && tokenData){
                callback(200, tokenData);
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, 'Missing or invalid required field!');
    }
};

//Define tokens put submethod
handlers._tokens.put = (data, callback) => {  
    /* Required data: id, extend
       optional data: none
       @TODO: only let authenticaded users update their own object. Don't let them update anyone else's.
     */
    //check valid fields
    console.log(data.payload);
    console.log(data.payload.id);
    console.log(data.payload.extend);

    const id = typeof(data.payload.id) == 'string' ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend){
        //Lookup the token
        schreiber.read('tokens',id, (err, tokenData) => {
            if(!err && tokenData){
                //check to if token isn't already expired
                if(tokenData.expires > Date.now()){
                    tokenData.expires = Date.now() + 1000 * 60 * 60;
                    //Store the new updates
                    schreiber.update('tokens', id, tokenData, (err) =>{
                        if(!err || err == 200){
                            callback(200, tokenData);
                        } else {
                            callback(500, err);
                        }
                    });
                } else {
                    callback(400, {'Error':'Token expired and could not be updated!'})
                }
            } else {
                callback(500, {'Error':'Could not retrieve tokenData'});
            }
        });
    } else {
        callback(400, {'Error': 'Missing required fields or field(s) are invalid'});
    }
};

//Define users delete submethod
handlers._tokens.delete = (data, callback) => {
    /* Required data: id
       optional data: none
       @TODO: only let authenticaded user delete their own object. Don't let them access anyone else's.
     */
    //check valid id
    const id = typeof(data.queryStringObject.id) == 'string'? data.queryStringObject.id.trim() : false;

    if(id){
        schreiber.read('tokens', id, (err, data) => {
            if(!err && data){
                //Do not provide the hashed password to the wild
                schreiber.delete('tokens', id, (err) => {
                    if(!err || err == 200){
                        callback(200, {'Message':'Token Deleted!'});
                    } else{
                        callback(500, {'Error': 'Could not delete token!'})        
                    }
                })
            } else {
                callback(404, {'Error': 'Could not find the specified token!'});
            }
        });
    } else {
        callback(404, {'Error':'Missing or invalid required field!'});
    }
};

//Verify if a given token id is currently valid
handlers._tokens.verifyToken = (id, phone, callback) => {
    //lookup the token
    schreiber.read('tokens', id, (err, tokenData) => {
        if(!err && tokenData){
            //check that token is for the given user and has not expired
            if(tokenData.phone == phone && tokenData.expires > Date.now()){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false, {'Error': 'Could not find the specified token!'});
        }
    });
};

//Checks
handlers.checks = (data, callback) => {
    const acceptableMethods = ['get','post','put','delete'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._checks[data.method](data, callback);
    } else{
        callback(405);
    }
};

//Container for all the checks methods
handlers._checks = {};
/* Checks Params:
Required data: protocol, url, method, successCodes, timeoutSeconds
Optional data: none*/

handlers._checks = {};

//Define checks post submethod
handlers._checks.post = (data, callback) => {
    /* 
    required data: protocol, url, method, successCodes, timeoutSeconds
     */

    //Validate inputs
    const protocol =  typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url =  typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false;
    const method =  typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes =  typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds =  typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(protocol && url && method && successCodes && timeoutSeconds){
        //Get token from the headers
        let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
        schreiber.read('tokens', token, (err, tokenData) => {
            if(!err && tokenData){
                let userPhone = tokenData.phone
                //Verify token auth
                handlers._tokens.verifyToken(token, userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        //lookup the user data
                        schreiber.read('users', userPhone, (err, userData) => {
                            if(!err && userData){
                                //verify user's checks
                                let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                //Verify that the user has less than the number of max-checks-per-user
                                if(userChecks.length < config.maxChecks){
                                    let checkId = tools.createRandomString(20);
                                    let checkObject = {
                                        'id' : checkId,
                                        'userPhone' : userPhone,
                                        'protocol' : protocol,
                                        'url': url,
                                        'method' : method,
                                        'successCodes' : successCodes,
                                        'timeoutSeconds' : timeoutSeconds
                                    };
                                    //Save the object
                                    schreiber.create('checks', checkId, checkObject, (err) => {
                                        if(!err || err == 200){
                                            //Add the check id to the user's object
                                            userData.checks = userChecks;
                                            userData.checks.push(checkId);
                                            //Save the new user data
                                            schreiber.update('users', userPhone, userData, (err) => {
                                                if(!err || err == 200){
                                                    callback(200);
                                                } else {
                                                    callback(500, {'Error' : 'Could not update the user with the new check'});
                                                }
                                            });
                                        } else {
                                            callback(500, {'Error':'Could not create the new check'});
                                        }
                                    });
                                } else{
                                    callback(403, {'Error':`User has achieved its maximum number (${config.maxChecks}) of checks!`});
                                }
                            } else {
                                callback(400, {'Error' : 'User not Found!'});
                            }
                        });
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(403);
            }
        });
    } else {
        callback(400, {'Error':'Missing required inputs, or inputs are invalid!'});
    }
};

//Define checks post submethod
handlers._checks.get = (data, callback) => {
    //check that the id is valid
    const checkId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    if(checkId){
        //Lookup the check
        schreiber.read('checks', checkId, (err, checkData) => {
            if(!err && checkData){
                //Get the token from the headers
                let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
                //Verify if a given token id is currently valid
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        callback(200, checkData);
                    } else {
                        callback(403);
                    }
                });
            } else {
                callback(404);
            }
        });
    } else {
        callback(400, 'Missing or invalid required field!');
    }
};

//Define checks put submethod
handlers._checks.put = (data, callback) => {
    /* Required data: Id,
       Optional data: protocol, url, method, successCodes, timeoutSeconds (at least one must be provided)
    */
    
    //Validate inputs
    const checkId = typeof(data.payload.id) == 'string' && data.payload.id.trim().length == 20 ? data.payload.id.trim() : false;

    //Check for the optional fields
    const protocol =  typeof(data.payload.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.protocol) > -1 ? data.payload.protocol : false;
    const url =  typeof(data.payload.url) == 'string' && data.payload.url.trim().length > 0 ? data.payload.url : false;
    const method =  typeof(data.payload.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.method) > -1 ? data.payload.method : false;
    const successCodes =  typeof(data.payload.successCodes) == 'object' && data.payload.successCodes instanceof Array && data.payload.successCodes.length > 0 ? data.payload.successCodes : false;
    const timeoutSeconds =  typeof(data.payload.timeoutSeconds) == 'number' && data.payload.timeoutSeconds % 1 === 0 && data.payload.timeoutSeconds >= 1 && data.payload.timeoutSeconds <= 5 ? data.payload.timeoutSeconds : false;

    if(checkId){
        //check to make sure one or more optional fields has been sent
        if(protocol || url || successCodes || timeoutSeconds){
            //Lookup the check
            schreiber.read('checks', checkId, (err, checkData) => {
                if(!err && checkData){
                    //Get the token from the headers
                    let token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;
                    //Verify if a given token id is currently valid
                    handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                        if(tokenIsValid){
                            //update the check where necessary
                            if(protocol){
                                checkData.protocol = protocol
                            }
                            if(url){
                                checkData.url = url
                            }
                            if(method){
                                checkData.method = method
                            }
                            if(successCodes){
                                checkData.successCodes = successCodes
                            }
                            if(timeoutSeconds){
                                checkData.timeoutSeconds = timeoutSeconds
                            }
                            //Store the updates
                            schreiber.update('checks', checkId, checkData, (err) => {
                                if(!err || err == 200){
                                    callback(200, checkData);
                                } else {
                                    callback(500, {'Error':'Couldn\'t update the data!'});
                                }
                            });
                        } else {
                            callback(403);
                        }
                    });
                } else {
                    callback(404);
                }
            });
        } else {
            callback(400, {'Error':'At least one parameter is required!'})
        }
    } else {
        callback(400, {'Error':'Invalid item or it no longer exists!'});
    }
};

//Define checks delete submethod
handlers._checks.delete = (data, callback) => {
    /* Required data: Id;
       Optional data: none;
    */

    //Validate inputs
    const checkId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;
    //Get token from the headers
    const token = typeof(data.headers.token) == 'string' && data.headers.token.length == 20 ? data.headers.token : false;

    if(checkId){
        schreiber.read('checks', checkId, (err, checkData) => {
            if(!err){
                handlers._tokens.verifyToken(token, checkData.userPhone, (tokenIsValid) => {
                    if(tokenIsValid){
                        schreiber.delete('checks', checkId, callback);
                        schreiber.read('users', checkData.userPhone, (err, userData) =>{
                            if(!err){
                                //verify user's checks
                                let userChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array ? userData.checks : [];
                                //Grab checks position
                                let checksInd = userChecks.indexOf(checkId);
                                //Remove the deleted checks from the user's list.
                                if(checksInd > -1){
                                    userChecks.splice(checksInd, 1);
                                    //resave the user's data
                                    schreiber.update('users', checkData.userPhone, userData, (err) => {
                                        if(!err){
                                            callback(200);
                                        } else {
                                            callback(500, {'Error' : 'Could not save new data to user\'s file!'});
                                        }
                                    });
                                } else {
                                    callback(500, {'Error': 'Can\'t remove a non existent check!'});
                                }

                            } else {
                                callback(500, {'Error deleting user\'s checks': err});
                            }
                        });
                    } else {
                        callback(403, {'Error': 'This action is not allowed to this user'});
                    }
                });
            } else {
                callback(400, {'Error': 'Check no longer exists'});
            }
        });
    } else {
        callback(400, {'Error': 'Checks in invalid!'});
    }
}

//Ping Handler
handlers.ping = (data, callback) => {
    //route to inform the requestee that the app is alive
    callback(200);
};

//Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

//Export handlers
module.exports = handlers;