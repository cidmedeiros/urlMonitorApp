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
                            callback(err);
                        }
                    });
                } else {
                    callback(500, {'Error':'Could not hash the use\'s password!'})
                }
            } else {
                callback(500, {'Error': 'A user with that phone number already exists.'})
            }
        });
    } else {
        callback(500, {'Error':'Missing required information'});
    }
};

//Define users get submethod
handlers._users.get = (data, callback) => {
    /* Required data: phone
       optional data: none
       @TODO: only let authenticaded user access their own object only. Don't let them
       access anyone else's.
     */
    //check valid phone
    const phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;

    if(phone){
        schreiber.read('users', phone, (err, data) => {
            if(!err && data){
                //Do not provide the hash password to the world
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
    //
};

//Define users delete submethod
handlers._users.delete = (data, callback) => {
    //
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