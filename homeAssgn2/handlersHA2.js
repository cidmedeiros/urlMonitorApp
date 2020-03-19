/* 
Hub for all the handlers
 */

//Dependencies
const schreiber = require('./schreiberHA2');
const tolls = require('./toolsHA2');
const config = require('./configHA2');
//Define the handlers
var handlers = {};

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

    if(firstName && lastName && phone && password && tosAgreement){
        //Make sure the user doesn't already exists
        schreiber.read('users', phone, (err, data) => {
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