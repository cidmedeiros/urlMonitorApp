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
    /* Required Data: firstName, lastName, email, password, tosAgreement
       Optional Data: none
       Data must come in as a json parsed object */
    //check if all required data are filled out
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const email = typeof(data.payload.email) == 'string' && tools.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

    if(firstName && lastName && streetAddress && email && password && tosAgreement){
        //Make sure the user doesn't already exists
        schreiber.read('users', email, (err, data) => {
            if(err){
                //Hash the users password
                const hashedPass = tools.hash(password);
                //Before proceed check if hashing was successful
                if(hashedPass){
                    let UserObjct = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'email': email,
                        'streetAddress': streetAddress,
                        'password' : hashedPass,
                        'tosAgreement': true
                    }
                    console.log(UserObjct);
                    //Save User file
                    schreiber.create('users', email, UserObjct, (err) => {
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
                callback(400, {'Error': 'A user with that email already exists.'});
                console.log({'Error': 'A user with that email already exists.'});
            }
        });
    } else {
        callback(400, 'Missing required information');
    }
};

//Define users get submethod
handlers._users.get = (data, callback) => {
    /* Required data: email
       optional data: none
     */
    //check valid email
    const email = typeof(data.payload.email) == 'string' && tools.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

    if(email){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //Verify if a given token id is currently valid
        if(token){
            handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
                if(tokenIsValid){
                    schreiber.read('users', email, (err, Userdata) => {
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
        callback(400, {'Error':'Missing or invalid required field!'});
    }
};

//Define users put submethod
handlers._users.put = (data, callback) => {
    /* Required data: email && at least one optional data
    optional data: firstName, lastName, streetAddress, password (at least one must be specified)
    */

    //Check valid email
    const email = typeof(data.payload.email) == 'string' && tools.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

    // Check for the optional & password fields
    const firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
    const lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
    const streetAddress = typeof(data.payload.streetAddress) == 'string' && data.payload.streetAddress.trim().length > 0 ? data.payload.streetAddress.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(email){
        //Error if nothing is sent to update
        if(firstName || lastName || streetAddress || password){
            //Get the token from the headers
            const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
            if(token){
                //Verify if a given token id is currently valid
                handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
                    if(tokenIsValid){
                        schreiber.read('users', email, (err, userData) => {
                            if(!err && userData){
                                //Update fields necessary
                                if(firstName){
                                    userData.firstName = firstName;
                                }
                                if(lastName){
                                    userData.lastName = lastName;
                                }
                                if(streetAddress){
                                    userData.streetAddress = streetAddress;
                                }
                                if(password){
                                    userData.password = tools.hash(password);
                                }
                                //Store the new updates
                                schreiber.update('users', email, userData, (err) =>{
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
        callback(400, {'Error':'The provided email is invalid!'})
    }
};

//Define users delete submethod
handlers._users.delete = (data, callback) => {
    /* Required data: email
       optional data: none
     */
    //check valid phone
    const email = typeof(data.payload.email) == 'string' && tools.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;

    if(email){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        if(token){
            //Verify if a given token id is currently valid
            handlers._tokens.verifyToken(token, email, (tokenIsValid) => {
                if(tokenIsValid){
                    schreiber.read('users', email, (err, userData) => {
                        if(!err && userData){
                            schreiber.delete('users', email, (err) => {
                                if(!err || err == 200){
                                    //delete all data associated to the user
                                    //verify user's orders
                                    let userOrders = typeof(userData.orders) == 'object' && userData.orders instanceof Array ? userData.orders : [];
                                    let ordersToDelete = userOrders.length;
                                    if(ordersToDelete > 0){
                                        let ordersDeleted = 0;
                                        let deletionsError = false;
                                        //loop through the checks
                                        userOrders.forEach(orderId => {
                                            schreiber.delete('orders', orderId, (err) =>{
                                                if(err && err != 200){
                                                    deletionsError = true;
                                                }
                                                ordersDeleted++;
                                                if(ordersToDelete == ordersDeleted){
                                                    if(!deletionsError){
                                                        callback(200);
                                                    } else {
                                                        callback(500, {'Error': 'One or more of the user\'s orders could not be deleted. Some of them might not exist already.'});
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
    /* Required Data: email, password
       Optional Data: none
       Data must come in as a json parsed object */
    //check if all required data are filled out
    const email = typeof(data.payload.email) == 'string' && tools.validateEmail(data.payload.email.trim()) ? data.payload.email.trim() : false;
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

    if(email && password){
        //Lookup the user who matches that email number 
        schreiber.read('users', email, (err, userData) => {
            if(!err && userData){
                //Hash the sent password and compare it with stored one
                var hashedPass = tools.hash(password);
                if(hashedPass == userData.password){
                    let tokenId = tools.createRandomString(20); 
                    let expires = Date.now() + 1000 * 60 * 60;
                    let tokenObject = {
                        'email' : email,
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
            callback(404, {'Error': 'Could not find the specified token!'});
        }
    });
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