/* 
Hub for all the handlers
*/

 //Dependencies
 const schreiber = require('./schreiber');
 const tools = require('./tools');
 const config = require('./config');

//Define the handlers
var handlers = {};

/*
    **HTML API HANDLERS
 */

 //Index Handler
 handlers.index = (data, callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
        //Prepate data for interpolation
        let templateData = {
            'head.title' : 'Pizza Delivery - Made Simple',
            'head.description': 'We offer delicious pizzas, and fast deliveries',
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

//Create a session
handlers.sessionCreate = (data,callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Login to your Account',
        'head.description' : 'Please enter your phone number and password to access your account.',
        'body.class' : 'sessionCreate'
      };
      // Read in a template as a string
      tools.getTemplate('sessionCreate',templateData, (err,str)=> {
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

// Edit Your Account
handlers.accountEdit = (data,callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      //This is a protected page, so no metadata for head description in order to avois web scrappers
      var templateData = {
        'head.title' : 'Account Settings',
        'body.class' : 'accountEdit'
      };
      // Read in a template as a string
      tools.getTemplate('accountEdit',templateData, (err,str) => {
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

// Session has been deleted
handlers.sessionDeleted = (data,callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Logged Out',
        'head.description' : 'You have been logged out of your account.',
        'body.class' : 'sessionDeleted'
      };
      // Read in a template as a string
      tools.getTemplate('sessionDeleted',templateData, (err,str) => {
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

// Account has been deleted
handlers.accountDeleted = (data,callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Account Deleted',
        'head.description' : 'Your account has been deleted.',
        'body.class' : 'accountDeleted'
      };
      // Read in a template as a string
      tools.getTemplate('accountDeleted',templateData, (err,str) => {
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

// Account has been deleted
handlers.shoppingItems = (data,callback) => {
    // Reject any request that isn't a GET
    if(data.method == 'get'){
      // Prepare data for interpolation
      var templateData = {
        'head.title' : 'Shopping Cart',
        'body.class' : 'shoppingItems'
      };
      // Read in a template as a string
      tools.getTemplate('shoppingCart',templateData, (err,str) => {
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

//Define Menu function to handle all possible related http verbs
handlers.menu = (data, callback) => {
    const acceptableMethods = ['get'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._menu[data.method](data, callback);
    } else{
        callback(405);
    }
};

//SubContainer for handler.menu subMethods
handlers._menu = {};

/* Define menu get submethod.
Clients can only get menu information. They can not post or update the menu information. */
handlers._menu.get = (menu, callback) => {
    // Prepare data for interpolation
    var templateData = {
        'head.title' : 'Menu - Pizzas & Drinks',
        'head.description' : 'Make it Delicious',
        'body.class' : 'menu'
    };
    // Read in a template as a string
    tools.getTemplate('menu',templateData, (err,str)=> {
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
}

/*
    **JSON API HANDLERS
 */

//Users

//Users function to handle all possible related http verbs
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

//Define users post submethod -> it creates a client
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
    const tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? data.payload.tosAgreement : false;

    if(firstName && lastName && streetAddress && email && password && tosAgreement){
        //Make sure the user doesn't already exists
        schreiber.read('users', email, (err, data) => {
            if(err){
                //Hash the users password
                const hashedPass = tools.hash(password);
                //Before proceed check if hashing was successful
                if(hashedPass){
                    let cartId = tools.createRandomString(20);
                    let userData = {
                        'firstName' : firstName,
                        'lastName' : lastName,
                        'email': email,
                        'streetAddress': streetAddress,
                        'password' : hashedPass,
                        'tosAgreement': true,
                        'shoppingCart': cartId,
                        'orders': [],
                    }
                    //Save User file
                    schreiber.create('users', email, userData, (status,err) => {
                        if(!err){
                            //Create User's unique Shopping Cart
                            cartObject = {
                                'cartId': cartId,
                                'user': email,
                                'pizzas': [],
                                'drinks': [],
                                'desserts': []
                            }
                            schreiber.create('shoppingCarts', cartId, cartObject, (status, err) => {
                                if(!err){
                                    //Do not provide the hashed password to the wild
                                    callback(200);
                                } else {
                                    callback(500, err);
                                }
                            });
                        } else {
                            callback(500, err);
                        }
                    });
                } else {
                    callback(500, {'Error':'Could not hash the use\'s password!'});
                }
            } else {
                callback(400, {'Error': 'A user with that email already exists.'});
            }
        });
    } else {
        callback(400, 'Missing required information');
    }
};

//Define users get submethod -> it looks up a client's data (personal data, all orders and current shopping cart state)
handlers._users.get = (data, callback) => {
    /* Required data: email
       optional data: none
     */
    //check valid email
    const email = typeof(data.queryStringObject.email) == 'string' && tools.validateEmail(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;

    if(email){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        if(token){
            //Verify if a given token belongs to current user in session and has not expired
            handlers._tokens.verifyUserToken(token, email, (tokenIsValid) => {
                if(tokenIsValid){
                    schreiber.read('users', email, (err, userData) => {
                        if(!err && userData){
                            //Do not provide the hashed password to the wild
                            delete userData.password;
                            callback(200, userData);
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

//Define users put submethod -> it updates the clients personal data
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
                //Verify if a given token belongs to current user in session and has not expired
                handlers._tokens.verifyUserToken(token, email, (tokenIsValid) => {
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
                                        //Do not provide the hashed password to the wild
                                        delete userData.password;
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

/* Define users delete submethod -> it deletes a client. All the client's data can be deleted.
Its orders don't get deleted for they remain in a separate data collection.
Company policy is to keep all orders history for data-driven business decisions.
After deletion, the client's orders can't be traced back to it, though. */
handlers._users.delete = (data, callback) => {
    /* Required data: email
       optional data: none
     */
    //check valid phone
    const email = typeof(data.queryStringObject.email) == 'string' && tools.validateEmail(data.queryStringObject.email.trim()) ? data.queryStringObject.email.trim() : false;

    if(email){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        if(token){
            //Verify if a given token belongs to current user in session and has not expired
            handlers._tokens.verifyUserToken(token, email, (tokenIsValid) => {
                if(tokenIsValid){
                    schreiber.read('users', email, (err, userData) => {
                        if(!err && userData){
                            schreiber.delete('users', email, (err) => {
                                if(!err || err == 200){
                                    //delete all data associated to the user
                                    //delete user's shoppingcart
                                    let shoppingcart = typeof(userData.shoppingCart) == 'string' && userData.shoppingCart.length > 0 ? userData.shoppingCart : false;
                                    if(shoppingcart){
                                        schreiber.delete('shoppingCarts', shoppingcart, (err) =>{
                                            if(!err || err == 200){
                                                //verify user's orders
                                                let userOrders = typeof(userData.orders) == 'object' && userData.orders instanceof Array ? userData.orders : [];
                                                let ordersToDelete = userOrders.length;
                                                if(ordersToDelete > 0){
                                                    let ordersDeleted = 0;
                                                    let deletionsError = false;
                                                    //loop through the orders
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
                                            } else {
                                                    callback(500, {'Error': 'Could not delete user\'s shopping cart and orders. They might not exist already.'});
                                                }
                                            });
                                        } else {
                                            callback(500, {'Error': 'Could not delete user\'s related data!'});
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

//Tokens function to handle all possible related http verbs
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

//Define tokens post submethod ->  it creates a session (logIn) 
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

/* Define tokens get submethod -> to verify/validate a session.
The auth token is used by the API several times in order to grant or deny access to specific data */
handlers._tokens.get = (data, callback) => {
    /* Required data: id
       optional data: none */
    //check valid id
    const id = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.length == 20 ? data.queryStringObject.id.trim() : false;

    if(id){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //Verify if a given token id is the same of the current authenticated session
        if(token == id){
            //Verify if the token hasn't expired
            handlers._tokens.verifyExpiredToken(token, (isTokenValid) => {
                if(isTokenValid){
                    schreiber.read('tokens', id, (err, tokenData) => {
                        if(!err && tokenData){
                            callback(200, tokenData);
                        } else {
                            callback(404);
                        }
                    });
                } else {
                    callback(403, 'This Session has expired!');
                }
            });
        } else {
            callback(403, 'Not properly authenticated');
        }
    } else {
        callback(400, 'Missing or invalid required field!');
    }
};

//Define tokens put submethod ->  it extends a session for an active user
handlers._tokens.put = (data, callback) => {  
    /* Required data: id, extend
       optional data: none
     */
    //check valid fields
    const id = typeof(data.payload.id) == 'string' ? data.payload.id.trim() : false;
    const extend = typeof(data.payload.extend) == 'boolean' && data.payload.extend == true ? true : false;

    if(id && extend){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //Verify if a given token id is the same of the current authenticated session
        if(id == token){
            //Verify if the token hasn't expired
            handlers._tokens.verifyExpiredToken(token, (isTokenValid) => {
                if(isTokenValid){
                    //Lookup the token
                    schreiber.read('tokens',id, (err, tokenData) => {
                        if(!err && tokenData){
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
                            callback(500, {'Error':'Could not retrieve tokenData'});
                        }
                    });
                } else {
                    callback(403, 'This Session has expired!');
                }
            });
        } else {
            callback(403, 'Not properly authenticated');
        }
    } else {
        callback(400, {'Error': 'Missing required fields or field(s) are invalid'});
    }
};

//Define tokens delete submethod -> it end a session (logOut)
handlers._tokens.delete = (data, callback) => {
    /* Required data: id
       optional data: none
       @TODO: only let authenticaded user delete their own object. Don't let them access anyone else's.
     */
    //check valid id
    const id = typeof(data.queryStringObject.id) == 'string'? data.queryStringObject.id.trim() : false;

    if(id){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        //Verify if a given token id is the same of the current authenticated session
        if(id == token){
            schreiber.read('tokens', id, (err, data) => {
                if(!err && data){
                    //Do not provide the hashed password to the wild
                    schreiber.delete('tokens', id, (err) => {
                        if(!err || err == 200){
                            callback(200, {'Message':'Token Deleted!'});
                        } else{
                            callback(500, {'Error': 'Could not delete token!'});        
                        }
                    });
                } else {
                    callback(404, {'Error': 'Could not find the specified token!'});
                }
            });
        } else {
            callback(403, {'Message':'Not properly authenticated'});
        }
    } else {
        callback(404, {'Error':'Missing or invalid required field!'});
    }
};

/* Verify if a given token belongs to current user in session and has not expired.
The auth token is used by the API several times in order to grant or deny access to specific data. */
handlers._tokens.verifyUserToken = (token, email, callback) => {
    //lookup the token
    schreiber.read('tokens', token, (err, tokenData) => {
        if(!err && tokenData){
            //check that token is for the given user and has not expired
            if(tokenData.email == email && tokenData.expires > Date.now()){
                callback(true, tokenData);
            } else {
                callback(false);
            }
        } else {
            callback(false, {'Error': 'Could not find the specified token!'});
        }
    });
};

/* Verify if a given token has not expired.
The auth token is used by the API several times in order to grant or deny access to specific data */
handlers._tokens.verifyExpiredToken = (token, callback) => {
    //lookup the token
    schreiber.read('tokens', token, (err, tokenData) => {
        if(!err && tokenData){
            //check that token is for the given has not expired
            if(tokenData.expires > Date.now()){
                callback(true);
            } else {
                callback(false);
            }
        } else {
            callback(false, {'Error': 'Could not find the specified token!'});
        }
    });
} 

//ShoppingCart function to handle all possible related http verbs
handlers.shoppingcarts = (data, callback) => {
    const acceptableMethods = ['get','post','put'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._shoppingcarts[data.method](data, callback);
    } else{
        callback(405);
    }
};

//SubContainer for handler.shoppingCart subMethods
handlers._shoppingcarts = {};

/* Define shoppingCart post submethod.
A unique shopping cart is created to each client when the client is first created.
Client can not have more than one shopping cart. */
handlers._shoppingcarts.post = (data, callback) => {
    /* Required Data: at least one variable from the menu (pizzas, drinks, desserts)
    Optional Data: none
    Data must come in as a json parsed object */
    //check the provided data if filled out
    const pizza = typeof(data.payload.pizza) == 'object' && Object.keys(data.payload.pizza).length > 0 ? data.payload.pizza : false;
    const drink = typeof(data.payload.drink) == 'object' && Object.keys(data.payload.drink).length > 0 ? data.payload.drink : false;
    const dessert = typeof(data.payload.dessert) == 'object' && Object.keys(data.payload.dessert).length > 0 ? data.payload.dessert : false;
    //Get the token from the headers
    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    schreiber.read('tokens', token, (err, tokenData) => {
        let email = tokenData.email
        //Verify authentication
        handlers._tokens.verifyExpiredToken(token, (isTokenValid) =>{
            if(isTokenValid){
                //if authenticated get users data
                schreiber.read('users', email, (err, userData) => {
                    if(!err){
                        //get user's Shopping Cart
                        schreiber.read('shoppingCarts', userData.shoppingCart, (err, cartData) => {
                            if(!err){
                                if(pizza){
                                    pizza.itemId = tools.createRandomString(20);
                                    cartData.pizzas.push(pizza);
                                }
                                if(drink){
                                    drink.itemId = tools.createRandomString(20);
                                    cartData.drinks.push(drink);
                                }
                                if(dessert){
                                    dessert.itemId = tools.createRandomString(20);
                                    cartData.desserts.push(dessert);
                                }
                            schreiber.update('shoppingCarts', userData.shoppingCart, cartData, (err) => {
                                if(err == 200){
                                    callback(200, cartData);
                                } else {
                                    callback(500, {'Error':'Could not add item(s) to the cart!'});
                                }
                            });
                            } else {
                                callback(500, {'Error':'Could not find the user\'s Shopping Cart!'});
                            }
                        });
                    } else {
                        callback(500, {'Error':'Could not find the user!'});
                    }
                });
            } else {
                callback(403,  {'Error':'This session has expired!'});
            }
        });
    });
};

//Define shoppingCart get submethod -> it looks us up the current state of the shopping cart
handlers._shoppingcarts.get = (data, callback) => {
    /* Required data: cartId
       optional data: none
     */
    //check valid shoppingCart
    const cartId = typeof(data.queryStringObject.id) == 'string' && data.queryStringObject.id.trim().length == 20 ? data.queryStringObject.id.trim() : false;

    if(cartId){
        schreiber.read('shoppingCarts', cartId, (err, cartData) => {
            if(!err){
                let email = cartData.user;
                 //Get the token from the headers
                const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
                //Verify if the given token id is currently valid and if the user owns the cart
                if(token){
                    handlers._tokens.verifyUserToken(token, email, (tokenIsValid) => {
                        if(tokenIsValid){
                            callback(200, cartData);
                        } else {
                            callback(403, {'Error': 'Either the user does not exist, or the token is/has invalid/expired!'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Missing token in header, or token is invalid!'});
                }
            } else {
                callback(400, {'Error':'Shopping cart doesn\'t exist!'})
            }
        });
    } else {
        callback(400, {'Error':'Missing or invalid required field!'});
    }
};

/* Define shoppingCart put submethod -> it deletes or changes the items from the shopping cart.
Clients can only update their own shopping carts. */
handlers._shoppingcarts.put = (data, callback) => {
    /* Required data: itemId to be updated
       optional data: none
     */     
    //Data must come in as a json parsed object */
    //check the provided data if filled out
    const pizza = data.payload.pizza instanceof Array ? data.payload.pizza : false;
    const drink = data.payload.drink instanceof Array ? data.payload.drink : false;
    const dessert = data.payload.dessert instanceof Array ? data.payload.dessert : false;
    //check for the itemId
    if(pizza){
        for(var i = 0; i < pizza.length; i++){
            if(typeof(pizza[i]) == 'string'){
                pizza[i] = JSON.parse(pizza[i]);
            }
            if(pizza[i].hasOwnProperty('itemId') == false){
                pizza[i].itemId = tools.createRandomString(20);
            }
        }   
    }

    if(drink){
        for(var i = 0; i < drink.length; i++){
            if(typeof(drink[i]) == 'string'){
                drink[i] = JSON.parse(drink[i]);
            }
            if(drink[i].hasOwnProperty('itemId') == false){
                drink[i].itemId = tools.createRandomString(20);
            }
        }   
    }

    if(dessert){
        for(var i = 0; i < dessert.length; i++){
            if(typeof(dessert[i]) == 'string'){
                dessert[i] = JSON.parse(dessert[i]);
            }
            if(dessert[i].hasOwnProperty('itemId') == false){
                dessert[i].itemId = tools.createRandomString(20);
            }
        }   
    }

    //Get the token from the headers
    const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;

    schreiber.read('tokens', token, (err, tokenData) => {
        if(!err){
            let email = tokenData.email
            //Verify authentication
            handlers._tokens.verifyExpiredToken(token, (isTokenValid) =>{
                if(isTokenValid){
                    //if authenticated get users data
                    schreiber.read('users', email, (err, userData) => {
                        if(!err){
                            //get user's Shopping Cart
                            schreiber.read('shoppingCarts', userData.shoppingCart, (err, cartData) => {
                                if(!err){
                                    if(cartData.pizzas.length > 0){
                                        for(var i = 0; i < cartData.pizzas.length; i++){
                                            for(item of pizza){
                                                if(cartData.pizzas[i].itemId == item.itemId){
                                                    cartData.pizzas.splice(i,1);
                                                    cartData.pizzas.push(item);
                                                } else{
                                                    cartData.pizzas.push(item);
                                                }
                                            }
                                        }
                                    } else {
                                        for(item of pizza){
                                            cartData.pizzas.push(item);
                                        }
                                    }
                                    if(cartData.drinks.length > 0){
                                        for(var i = 0; i < cartData.drinks.length; i++){
                                            for(item of drink){
                                                if(cartData.drinks[i].itemId == item.itemId){
                                                    cartData.drinks.splice(i,1);
                                                    cartData.drinks.push(item);
                                                } else{
                                                    cartData.drinks.push(item);
                                                }
                                            }
                                        }
                                    } else {
                                        for(item of drink){
                                            cartData.drinks.push(item);
                                        }
                                    }
                                    if(cartData.desserts.length > 0){
                                        for(var i = 0; i < cartData.desserts.length; i++){
                                            for(item of dessert){
                                                if(cartData.desserts[i].itemId == item.itemId){
                                                    cartData.desserts.splice(i,1);
                                                    cartData.desserts.push(item);
                                                } else{
                                                    cartData.desserts.push(item);
                                                }
                                            }
                                        }
                                    } else {
                                        for(item of dessert){
                                            cartData.desserts.push(item);
                                        }
                                    }
                                    schreiber.update('shoppingCarts', userData.shoppingCart, cartData, (err) => {
                                        if(err == 200){
                                            callback(200, cartData);
                                        } else {
                                            callback(500, {'Error':'Could not update Shopping Cart!'});
                                        }
                                    });
                                }
                            });
                        } else {
                            callback(500, {'Error':'Could not find the user!'});
                        }
                    });
                } else {
                    callback(403,  {'Error':'This session has expired!'});
                }
            });
        } else {
            callback(403, {'Error':'User not proper authenticated'})
        }
    });
};

/* Orders function to handle all possible related http verbs.
Orders can not be deleted or changed. Company policy is to keep all orders history for data-driven business decisions. */
handlers.orders = (data, callback) => {
    const acceptableMethods = ['get','post'];
    if(acceptableMethods.indexOf(data.method) > -1){
        handlers._orders[data.method](data, callback);
    } else{
        callback(405);
    }
};

//SubContainer for handler.uses subMethods
handlers._orders = {};

/* Define Orders post submethod -> it places an order.
An order is composed of all items in the shopping cart.
Although a placed order is saved on its own it gets linked to the issuing client.*/
handlers._orders.post = (data, callback) => {
    /* Required data: shoppingCartId*/
    //check the incoming data
    const shoppingCartId = typeof(data.payload.shoppingCartId) == 'string' && data.payload.shoppingCartId.length == 20 ? data.payload.shoppingCartId.trim() : false;

    orderCard = typeof(data.payload.card) === 'string' && config.stripeInfo.card.indexOf(data.payload.card) > -1 ? data.payload.card.trim() : false;

    if(shoppingCartId){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        if(token){
            schreiber.read('shoppingCarts', shoppingCartId, (err, shopData) =>{
                if(!err){
                    const email = shopData.user
                    //Verify if a given token belongs to current user in session and has not expired
                    handlers._tokens.verifyUserToken(token, email, (tokenIsValid) => {
                        if(tokenIsValid){
                            let order = {
                                orderId : tools.createRandomString(20),
                                paymentMethod: orderCard,
                                pizzas: [],
                                drinks: [],
                                desserts: [],
                                amount : 0
                            }
                            if(shopData.pizzas.length > 0){
                                shopData.pizzas.forEach(pizza =>{
                                    order.pizzas.push(pizza);
                                    order.amount = Object.keys(pizza).indexOf('sm') > -1 ? order.amount + pizza.sm : order.amount+ pizza.lg;
                                });
                            }
                            if(shopData.drinks.length > 0){
                                shopData.drinks.forEach(drink =>{
                                    order.drinks.push(drink);
                                    order.amount = Object.keys(drink).indexOf('sm') > -1 ? order.amount + drink.sm : order.amount + drink.lg
                                })
                            }
                            if(shopData.desserts.length > 0){
                                shopData.desserts.forEach(dessert =>{
                                    order.desserts.push(dessert);
                                    order.amount = Object.keys(dessert).indexOf('sm') > -1 ? order.amount + dessert.sm : order.amount + dessert.lg
                                })
                            }
                            order.amount = Math.round(order.amount).toFixed(2);
                            tools.charge(order, (confirmedpay) => {
                                if(confirmedpay){
                                    tools.sendEmail(email, order, (err) => {
                                        if(!err){
                                            order.receiptEmail = confirmedReceipt;
                                        } else {
                                            order.receiptEmail = false;
                                        }
                                    });
                                    shoppingCart = {
                                        cartId:shoppingCartId,
                                        user:email,
                                        pizzas: [],
                                        drinks: [],
                                        desserts: []
                                    }
                                    schreiber.update('shoppingCarts', shoppingCartId, shoppingCart, (err) => {
                                        if(!err || err == 200){
                                            schreiber.create('orders', order.orderId, order, (err) =>{
                                                if(!err || err == 200){
                                                    schreiber.read('users', email, (err, userData) =>{
                                                        if(!err){
                                                            userData.orders.push(order.orderId);
                                                            schreiber.update('users', email, userData, (err) => {
                                                                if(!err || err == 200){
                                                                    callback(200);
                                                                } else {
                                                                    callback(500, {'Could not update user\'s file.': err});
                                                                }
                                                            });
                                                        } else {
                                                            callback(500, {'Could not add order to user\'s history': err});
                                                        }
                                                    });
                                                } else {
                                                    callback(500, {'Could not save order': err});
                                                }
                                            });
                                        } else {
                                            callback(500, {'Could not empty shoppingCart!':err});
                                        }
                                    })
                                } else{
                                    callback(400, {'Error': 'Your payment could not be confirmed!'});
                                }
                            })
                        } else {
                            callback(403, {'Error': 'Either the user does not exist, or the token is/has invalid/expired!'});
                        }
                    });
                } else {
                    callback(403, {'Error': 'Token is/has invalid/expired!'});
                }
            });
        } else {
            callback(403, {'Error': 'Missing token in header, or token is invalid!'});
        }
    } else {
        callback(400, {'Error':'Missing or invalid required field!'});
    }
}

//Define Orders get submethod -> it looks up an order
handlers._orders.get = (data, callback) => {
    /* Required data: orderId*/
    //check the incoming data
    const orderId = typeof(data.queryStringObject.orderId) == 'string' && data.queryStringObject.orderId.length == 20 ? data.queryStringObject.orderId.trim() : false;

    if(orderId){
        //Get the token from the headers
        const token = typeof(data.headers.token) == 'string' ? data.headers.token : false;
        if(token){
            schreiber.read('tokens', token, (err, tokenData) =>{
                let userEmail = tokenData.email;
                //Verify if the given token id is currently valid
                handlers._tokens.verifyUserToken(token, userEmail, (tokenIsValid) => {
                    if(tokenIsValid){
                        schreiber.read('users', userEmail, (err, userData) => {
                            if(!err){
                                if(userData.orders.indexOf(orderId) > -1){
                                    schreiber.read('orders', orderId, (err, order) =>{
                                        if(!err){
                                            callback(200, order);
                                        } else {
                                            callback(500, {'Error':'Could not retrieve order\'s data!'})
                                        }
                                    });
                                } else {
                                    callback(403, {'Error': 'This orders does not belong to the current client!'})
                                }
                            } else{
                                callback(500, {'Error':'Could not retrieve user\'s data!'});
                            }
                        });
                    } else {
                        callback(403, {'Error': 'Either the user does not exist, or the token is/has invalid/expired!'});
                    }
                });
            });
        } else {
            callback(403, {'Error': 'Missing token in header, or token is invalid!'});
        }
    } else{
        callback(400, {'Error':'Missing or invalid required field!'});
    }
}

//Not found handler
handlers.notFound = (data, callback) => {
    callback(404);
}

//Export handlers
module.exports = handlers;