/* 
Hub for all the handlers
 */

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

//Container for handler.uses subMethods
handlers._users = {};

//Define users post submethod
handlers._users.post = (data, callback) => {
    /* Required Data: firstName, lastName, phone, password, tosAgreement
       Optional Data: none */
    //check if all required data are filled out
};

//Define users get submethod
handlers._users.get = (data, callback) => {
    //
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