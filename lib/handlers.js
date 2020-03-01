/* 
Hub for all the handlers
 */

 //Dependencies
 const schreiber = require('./data');
 const tolls = require('./tools')

//Define the handlers
var handlers = {};

//Users Handler
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
                        if(!err){
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
       @TODO: only let authenticaded user access their own object. Don't let them access anyone else's.
     */
    //check valid phone
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone){
        schreiber.read('users', phone, (err, data) => {
            if(!err && data){
                //Do not provide the hashed password to the wild
                delete data.password;
                callback(200, data);
            } else {
                callback(404);
            }
        });
    } else {
        callback(404, 'Missing or invalid required field!');
    }
};

//Define users put submethod
handlers._users.put = (data, callback) => {  
    /* Required data: phone
    optional data: firstName, lastName, password (at least one must be specified)
    @TODO: only let authenticaded users update their own object. Don't let them update anyone else's.
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
                        if(!err || err == 400){
                            callback(200, {'Message': 'update successful!'});
                        } else {
                            callback(500, {'Error': 'Could not update the user!'});
                        }
                    });
                } else{
                    callback(400, {'Error':'The specified user does not exist!'})
                }
            });
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
       @TODO: only let authenticaded user access their own object. Don't let them access anyone else's.
       @TODO: clean up (delete) any other files associated with this user
     */
    //check valid phone
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone){
        schreiber.read('users', phone, (err, data) => {
            if(!err && data){
                //Do not provide the hashed password to the wild
                schreiber.delete('users', phone, (err) => {
                    if(!err || err == 200){
                        callback(200, {'Message':'User Deleted!'});
                    } else{
                        callback(500, {'Error': 'Could not delete user!'})        
                    }
                })
            } else {
                callback(404, {'Error': 'Could not find the specified user!'});
            }
        });
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
       Optional Data: none */
    //check if all required data are filled out
    console.log('youve reached tokens post page');
    console.log(data.payload);
    const phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
    console.log(phone);
    const password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
    console.log(password);

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
                            callback(500, {'message':'Error saving the token!'});
                        }
                    })
                } else {
                    callback(400, {'Error':'The password did not match!'});
                }
            } else{
                callback(400, {'Error':'Could not find the specified user'});
            }
        });
    } else {
        callback(400, {'Error':'Missing required field(s)'});
    }
};

//Define tokens get submethod
handlers._tokens.get = (data, callback) => {
    /* Required data: phone
       optional data: none
       @TODO: only let authenticaded user access their own object. Don't let them access anyone else's.
     */
    //check valid phone
    
};

//Define tokens put submethod
handlers._tokens.put = (data, callback) => {  
    /* Required data: phone
    optional data: firstName, lastName, password (at least one must be specified)
    @TODO: only let authenticaded users update their own object. Don't let them update anyone else's.
    */

    //Check valid phone
    
};

//Define users delete submethod
handlers._tokens.delete = (data, callback) => {
    /* Required data: phone
       optional data: none
       @TODO: only let authenticaded user access their own object. Don't let them access anyone else's.
       @TODO: clean up (delete) any other files associated with this user
     */
    //check valid phone
    
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