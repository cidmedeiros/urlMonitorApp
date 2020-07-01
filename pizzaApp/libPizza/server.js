//SERVER-related tasks

//Dependencies
const https = require('https');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;
const config = require('./config');
const fs = require('fs');
const handlers = require('./handlers');
const tools = require('./tools');
const path = require('path');
const util = require('util');
const debug = util.debuglog('server');//to monitor the server module -> NODE_DEBUG=server node index.js

//Instantiate the server module object
var server = {};

//Instantiate HTTPS server
server.httpsServerOptions = {
    'key': fs.readFileSync(path.join(__dirname,'../../https/key.pem')),
    'cert': fs.readFileSync(path.join(__dirname,'/../../https/cert.pem')),
    passphrase: 'somethingidontknow'
};

//It creates a https server
server.httpsServer = https.createServer(server.httpsServerOptions,(req, res) => {
    server.unifiedServer(req, res);
});

/* Server seetings -> it processes the incoming url/data embedded in the request object then assigns the associated action to it by calling server.route which calls the specific handlers' funcion */
server.unifiedServer = (req, res) => {
    //get the URl and parse it
    //the true argmnt tells the url module to call the query-stream module
    let parseUrl = url.parse(req.url, true);

    //get the path: 1 -> untrimmed; 2 -> trimmes the slashes out
    let path = parseUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the query string as an object
    let queryStringObject = parseUrl.query;

    //get the HTTP method
    let method = req.method.toLocaleLowerCase();

    //get the headers as an object
    let headers = req.headers

    //get the payload as an object, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';

    //on means event emitter. The data means stream of data
    req.on('data', (data) =>{
        buffer += decoder.write(data);
    });
    
    //end finalizes the event emitter
    req.on('end', () =>{
        //cuts off data stream
        buffer += decoder.end();

        //construct the data object to send to the chosenhandler
        let data = {
            'trimmedPath': trimmedPath,
            'queryStringObject': queryStringObject,
            'method': method,
            'headers': headers,
            'payload': tools.parseJsonToObject(buffer) //make sure the incoming data is an Object
        }

        /* 
            * It stores the specific handler from handlers file.
            * Verifies the handler (function defined in the handlers file) this request should go to.
            * If one is not found, it should go to notFound handler.
        */
        let chosenhandler = typeof(server.router[trimmedPath]) !== 'undefined' ? server.router[trimmedPath] : handlers.notFound;
        
        //if the request is within the public directory, use the public handler instead
        chosenhandler = trimmedPath.indexOf('public/') > -1 ? handlers.public : chosenhandler;

        /* 
            * Calls the handlers function
            * Sets up a GENERAL scheme to deal with the handlers' function response and route the response back to the browser
         */
        chosenhandler(data, (statusCode, handlerPayload, contentType) => {
            //Determine the type of response (fallback to JSON)
            contentType = typeof(contentType) == 'string' ? contentType : 'json';

            //use the handler statusCode or default to 200
            statusCode = typeof(statusCode) == 'number' ? statusCode : 200;

            //Return the response-parts that are content-specific (sets header and payloads the content)
            var handlerPayloadString = ''
            if(contentType == 'json'){
                res.setHeader('Content-Type', 'application/json');
                //use the handler payload object if any or default to {}
                handlerPayload = typeof(handlerPayload) == 'object' ? handlerPayload : {};
                //convert the handlerPayload to String
                handlerPayloadString = JSON.stringify(handlerPayload);
            }
            if(contentType == 'html'){
                res.setHeader('Content-Type', 'text/html');
                handlerPayload = typeof(handlerPayload) == 'string' ? handlerPayload : '';
                //Use the universal default variable
                handlerPayloadString = handlerPayload;
            }
            if(contentType == 'css'){
                res.setHeader('Content-Type', 'text/css');
                handlerPayload = typeof(handlerPayload) !== 'undefined' ? handlerPayload : '';
                //Use the universal default variable
                handlerPayloadString = handlerPayload;
            }
            if(contentType == 'favicon'){
                res.setHeader('Content-Type', 'image/x-icon');
                handlerPayload = typeof(handlerPayload) !== 'undefined' ? handlerPayload : '';
                //Use the universal default variable
                handlerPayloadString = handlerPayload;
            }
            if(contentType == 'png'){
                res.setHeader('Content-Type', 'image/png');
                handlerPayload = typeof(handlerPayload) !== 'undefined' ? handlerPayload : '';
                //Use the universal default variable
                handlerPayloadString = handlerPayload;
            }
            if(contentType == 'jpg'){
                res.setHeader('Content-Type', 'image/jpeg');
                handlerPayload = typeof(handlerPayload) !== 'undefined' ? handlerPayload : '';
                //Use the universal default variable
                handlerPayloadString = handlerPayload;
            }
            if(contentType == 'plain'){
                res.setHeader('Content-Type', 'text/plain');
                handlerPayload = typeof(handlerPayload) !== 'undefined' ? handlerPayload : '';
                //Use the universal default variable
                handlerPayloadString = handlerPayload;
            }

            //Return the response-parts that are common
            res.writeHead(statusCode);
            res.end(handlerPayloadString);

            //if the response is 200 print green, otherwise print red
            if(statusCode == 200){
                debug('\x1b[32m%s\x1b[0m',`${method.toUpperCase()} /${trimmedPath} ${statusCode}}`);
            } else {
                debug('\x1b[31m%s\x1b[0m',`${method.toUpperCase()} /${trimmedPath} ${statusCode}}`);
            }
        });
    });
};

/* 
    * Define a request router
    * It just stores the key value for mapping-calling the handlers' object 
*/
server.router = {
    '': handlers.index,
    'account/create': handlers.accountCreate,
    'account/edit': handlers.accountEdit,
    'account/deleted': handlers.accountDeleted,
    'session/create': handlers.sessionCreate,
    'session/deleted': handlers.sessionDeleted,
    'menu': handlers.menuPage,
    'shoppingcarts/all': handlers.shoppingItems,
    'shoppingcarts/edit': handlers.shoppingEdit,
    'orders/all': handlers.ordersList,
    'api/users': handlers.users,
    'api/tokens' : handlers.tokens,
    'api/shoppingcarts' : handlers.shoppingcarts,
    'api/menu': handlers.menu,
    'api/orders': handlers.orders,
    'favicon.ico': handlers.favicon,
    'public': handlers.public
};

//Define server init function
server.init = () =>{
    //Start the HTTP server and have it listen to the Env port
    server.httpsServer.listen(config.httpsPort, () =>{
        console.log('\x1b[36m%s\x1b[0m', `Server running on ${config.envName} mode, and listening on port ${config.httpsPort} with HTTPS protocol`);
    });
};

//Export server module
module.exports = server;