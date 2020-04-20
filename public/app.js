/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

//Config
app.config = {
    'sessionToken' : false
}

//AJAX client container (for the restful API)
app.client = {}

//Crafting the http resquest client-side
app.client.request = (headers, path, method, queryStringObject, payload, callback) => {
    //Set defaults
    headers = typeof(headers) == 'object' && headers !== null ? headers : false;
    path = typeof(path) == 'string' ? path : '/';
    method = typeof(method) == 'string' && ['GET','POST','PUT','DELETE'].indexOf(method) > -1 ? method.toUpperCase() : 'GET';
    queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : false;
    payload = typeof(payload) == 'object' && payload !== null ? payload : false;
    callback = typeof(callback) == 'function' ? callback : false;

    //for each query string parameter sent, add it to the path
    let requestUrl = path+'?';
    let counter = 0;
    for(var queryKey in queryStringObject){
        counter++;
        //if at least one query string parameter has already been added, prepend new parameter with ampersand
        if(counter > 1){
            requestUrl+='&';
        }
        requestUrl+=queryKey+'='+queryStringObject[queryKey];
    }

    //Creating a new XMLHttpRequest
    let xhr = new XMLHttpRequest();
    xhr.open(method, requestUrl, true);
    //Form the http request as a JSON type
    xhr.setRequestHeader('Content-type', 'application/json');

    //for each header sent, add it to the request
    for(var headerKey in headers){
        if(headers.hasOwnProperty(headerKey)){
            xhr.setRequestHeader(headerKey, headers[headerKey]);
        }
    };

    //If there is a current session token set, add that as a header
    if(app.config.sessionToken){
        xhr.setRequestHeader('token', app.config.sessionToken.id);
    }

    //when the request comes back, handle the response
    xhr.onreadystatechange = () => {
        if(xhr.readyState = XMLHttpRequest.DONE){
            let statusCode = xhr.status;
            let ResponseReturned = xhr.responseText;

            //Callback if requested
            if(callback){
                try{
                    let parsedResponde = JSON.parse(ResponseReturned);
                    callback(statusCode, parsedResponde);
                } catch(e) {

                }
            }
        }
    }

    //send the payload as JSON
    let payloadString = JSON.stringify(payload);
    xhr.send(payloadString);
}