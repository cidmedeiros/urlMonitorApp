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
    let requestUrl = path;
    let counter = 0;
    for(var queryKey in queryStringObject){
        if(queryStringObject.hasOwnProperty(queryKey)){
            if(counter == 0){
                requestUrl+='?'
            }
            counter++;
            // If at least one query string parameter has already been added, preprend new ones with an ampersand
            if(counter > 1){
              requestUrl+='&';
            }
            // Add the key and value
            requestUrl+=queryKey+'='+queryStringObject[queryKey];
        }
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

// Bind the forms
app.bindForms = function(){
    document.querySelector("form").addEventListener("submit", function(e) {
        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#"+formId+" .formError").style.display = 'hidden';

        // Turn the inputs into a payload
        var payload = {};
        var elements = this.elements;
        for(var i = 0; i < elements.length; i++){
        if(elements[i].type !== 'submit'){
            var valueOfElement = elements[i].type == 'checkbox' ? elements[i].checked : elements[i].value;
            payload[elements[i].name] = valueOfElement;
        }
        }

        // Call the API
        app.client.request(undefined,path,method,undefined,payload, (statusCode,responsePayload) => {
        // Display an error on the form if needed
        if(statusCode !== 200){

            // Try to get the error from the api, or set a default error message
            var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

            // Set the formError field with the error text
            document.querySelector("#"+formId+" .formError").innerHTML = error;

            // Show (unhide) the form error field on the form
            document.querySelector("#"+formId+" .formError").style.display = 'block';

        } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload);
        }

        });
    });
};
    
// Form response processor
app.formResponseProcessor = (formId,requestPayload,responsePayload) => {
    var functionToCall = false;
    if(formId == 'accountCreate'){
    // @TODO Do something here now that the account has been created successfully

    }
};
  
  // Init (bootstrapping)
  app.init = function(){
    // Bind all form submissions
    app.bindForms();
  };
  
  // Call the init processes after the window loads
  window.onload = function(){
    app.init();
  };