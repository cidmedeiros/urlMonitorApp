/*
 * Frontend Logic for application
 *
 */

// Container for frontend application
var app = {};

// Config
app.config = {
  'sessionToken' : false
};

// AJAX Client (for RESTful API)
app.client = {}

// Interface for making API calls using AJAX - crafting a request to the server
app.client.request = function(headers,path,method,queryStringObject,payload,callback){

  // Set defaults (except for path & method, the rest are optional)
  //headers is for addional info, for the token is automatically added at the end of the function
  headers = typeof(headers) == 'object' && headers !== null ? headers : {};
  path = typeof(path) == 'string' ? path : '/'; //default to home page
  method = typeof(method) == 'string' && ['POST','GET','PUT','DELETE'].indexOf(method.toUpperCase()) > -1 ? method.toUpperCase() : 'GET';
  queryStringObject = typeof(queryStringObject) == 'object' && queryStringObject !== null ? queryStringObject : {};
  payload = typeof(payload) == 'object' && payload !== null ? payload : {};
  callback = typeof(callback) == 'function' ? callback : false;

  // For each query string parameter sent, add it to the path
  var requestUrl = path+'?';
  var counter = 0; //track ampersand needs
  for(var queryKey in queryStringObject){
     if(queryStringObject.hasOwnProperty(queryKey)){
       counter++;
       // If at least one query string parameter has already been added, preprend new ones with an ampersand
       if(counter > 1){
         requestUrl+='&';
       }
       // Add the key and value
       requestUrl+=queryKey+'='+queryStringObject[queryKey];
     }
  }

  // Form the http request as a JSON type using AJAX
  // XMLHttpRequest ->  it's a built-in tool most web browsers have
  var xhr = new XMLHttpRequest();
  xhr.open(method, requestUrl, true);
  xhr.setRequestHeader("Content-type", "application/json");

  // For each header sent, add it to the request
  for(var headerKey in headers){
     if(headers.hasOwnProperty(headerKey)){
       xhr.setRequestHeader(headerKey, headers[headerKey]);
     }
  }

  // If there is a current session token set, add that as a header
  if(app.config.sessionToken){
    xhr.setRequestHeader("token", app.config.sessionToken.id);
  }

  // Send the payload as JSON
  var payloadString = JSON.stringify(payload);
  xhr.send(payloadString);

   // When the request comes back, handle the response
   xhr.onreadystatechange = function() {
     if(xhr.readyState == XMLHttpRequest.DONE) {
       var statusCode = xhr.status;
       var responseReturned = xhr.responseText;

       // Callback if requested
       if(callback){
         try{
           var parsedResponse = JSON.parse(responseReturned);
           callback(statusCode,parsedResponse);
         } catch(e){
           callback(statusCode,false);
         }
      }
    }
 }
};

// Bind the logout button
app.bindLogoutButton = function(){
  document.getElementById("logoutButton").addEventListener("click", function(e){

    // Stop it from redirecting anywhere
    e.preventDefault();

    // Log the user out
    app.logUserOut();

  });
};

// Log the user out then redirect them
app.logUserOut = function(redirectUser){
  // Set redirectUser to default to true
  redirectUser = typeof(redirectUser) == 'boolean' ? redirectUser : true;

  // Get the current token id
  var tokenId = typeof(app.config.sessionToken.id) == 'string' ? app.config.sessionToken.id : false;

  // Send the current token to the tokens endpoint to delete it
  var queryStringObject = {
    'id' : tokenId
  };
  app.client.request(undefined,'api/tokens','DELETE',queryStringObject,undefined,function(statusCode,responsePayload){
    // Set the app.config token as false
    app.setSessionToken(false);

    // Send the user to the logged out page
    if(redirectUser){
      window.location = '/session/deleted';
    }

  });
};

// Bind the forms - One of its mains features is to allow on page response to the user
app.bindForms = function(){
  if(document.querySelector("form")){
    //Store all the forms in the html page
    var allForms = document.querySelectorAll("form");
    for(var i = 0; i < allForms.length; i++){
        allForms[i].addEventListener("submit", function(e){

        // Stop it from submitting
        e.preventDefault();
        var formId = this.id;
        var path = this.action;
        var method = this.method.toUpperCase();

        // Hide the error message (if it's currently shown due to a previous error)
        document.querySelector("#"+formId+" .formError").style.display = 'none';

        // Hide the success message (if it's currently shown due to a previous error)
        if(document.querySelector("#"+formId+" .formSuccess")){
          document.querySelector("#"+formId+" .formSuccess").style.display = 'none';
        }

        // Turn the inputs into a payload
        var payload = {};
        payload.pizza = [];
        payload.drink = [];
        payload.dessert = [];
        var elements = this.elements;

        for(var i = 0; i < elements.length; i++){
          if(elements[i].type !== 'submit'){
            // Determine class of element and set value accordingly
            var classOfElement = typeof(elements[i].classList.value) == 'string' && elements[i].classList.value.length > 0 ? elements[i].classList.value : '';

            var valueOfElement = elements[i].type == 'checkbox' && classOfElement.indexOf('multiselect') == -1 ? elements[i].checked : classOfElement.indexOf('intval') == -1 ? elements[i].value : elements[i].value;

            var elementIsChecked = elements[i].checked;
            /* Override the method of the form if the input's name is _method
               It applies for form with a hidden input for PUT method */
            var nameOfElement = elements[i].name;
            if(nameOfElement == '_method'){
              method = valueOfElement;
            } else {
              // Create an payload field named "method" if the elements name is actually httpmethod
              if(nameOfElement == 'httpmethod'){
                nameOfElement = 'method';
              }
              // Create an payload field named "id" if the elements name is actually uid
              if(nameOfElement == 'uid'){
                nameOfElement = 'id';
              }
              // If the element has the class "multiselect" add its value(s) as array elements
              if(classOfElement.indexOf('multiselect') > -1 && classOfElement.indexOf('menu') == -1){
                if(elementIsChecked){
                  payload[nameOfElement] = typeof(payload[nameOfElement]) == 'object' && payload[nameOfElement] instanceof Array ? payload[nameOfElement] : [];
                  payload[nameOfElement].push(valueOfElement);
                }
              } else if(classOfElement.indexOf('menu') > -1){
                if(elementIsChecked){
                  if(nameOfElement.indexOf('pizza') > -1){
                    payload.pizza.push(valueOfElement);
                  }
                  if(nameOfElement.indexOf('drink')  > -1){
                    payload.drink.push(valueOfElement);
                  }
                  if(nameOfElement.indexOf('Desserts') > -1){
                    payload.dessert.push(valueOfElement);
                  }
                }
              } else {
                payload[nameOfElement] = valueOfElement;
              }
            }
          }
        }
        // If the method is DELETE, the payload should be a queryStringObject instead
        var queryStringObject = method == 'DELETE' ? payload : {};
        // Call the API - Do the actual submit
        app.client.request(undefined,path,method,queryStringObject,payload,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode !== 200){
            if(statusCode == 403){
              // log the user out
              app.logUserOut();
            } else {
              // Try to get the error from the api, or set a default error message
              var error = typeof(responsePayload.Error) == 'string' ? responsePayload.Error : 'An error has occured, please try again';

              // Set the formError field with the error text
              document.querySelector("#"+formId+" .formError").innerHTML = error;

              // Show (unhide) the form error field on the form
              document.querySelector("#"+formId+" .formError").style.display = 'block';
            }
          } else {
            // If successful, send to form response processor
            app.formResponseProcessor(formId,payload,responsePayload);
          }
        });
      });
    }
  }
};

// Form response processor
app.formResponseProcessor = function(formId,requestPayload,responsePayload){
  var functionToCall = false;
  // If account creation was successful, try to immediately log the user in
  if(formId == 'accountCreate'){
    // Take the email and password, and use it to log the user in
    var newPayload = {
      'email' : requestPayload.email,
      'password' : requestPayload.password
    };

    //Actually creating the token to log the new user in
    app.client.request(undefined,'api/tokens','POST',undefined,newPayload,function(newStatusCode,newResponsePayload){
      // Display an error to the user if the request status IS NOT 200
      if(newStatusCode !== 200){
        /* CSS on the fly response to the user */
        // Set the formError field with the error text
        document.querySelector("#"+formId+" .formError").innerHTML = 'Sorry, an error has occured. Please try again.';

        // Show (unhide) the form error field on the form
        document.querySelector("#"+formId+" .formError").style.display = 'block';

      } else {
        // If successful, set the token and redirect the user
        app.setSessionToken(newResponsePayload);
        window.location = 'api/menu';
      }
    });
  }

  // If regular login is successful, set the token in localstorage and redirect the user
  if(formId == 'sessionCreate'){
    app.setSessionToken(responsePayload);
    window.location = 'api/menu';
  }

  // If forms saved successfully, and they have success messages, show them
  var formsWithSuccessMessages = ['accountEdit1', 'accountEdit2','itemEdit'];
  if(formsWithSuccessMessages.indexOf(formId) > -1){
    //Works after the bindForms function has hidden whatever message was previously been shown
    document.querySelector("#"+formId+" .formSuccess").style.display = 'block';
  }

  // If the user just deleted their account, redirect them to the account-delete page
  if(formId == 'accountEdit3'){
    app.logUserOut(false);
    window.location = 'account/deleted';
  }

  // If the user just created a new order successfully, redirect back to the order successful page
  if(formId == 'formOrder'){
    // If successful, redirect the user to order successful page
    window.location = 'successpage/info';
  }

  // If the user just deleted an item from the shoppingCart, redirect them to the shoppingCart Page
  if(formId == 'addToCart'){
    window.location = 'shoppingcarts/all';
  }

  // If the user just deleted an item from the shoppingCart, redirect them to the shoppingCart Page
  if(formId == 'itemEdit'){
    window.location = 'shoppingcarts/edit';
  }
};

// Get the session token from localstorage and set it in the app.config object
app.getSessionToken = function(){
  var tokenString = localStorage.getItem('token');
  if(typeof(tokenString) == 'string'){
    try{
      var token = JSON.parse(tokenString);
      app.config.sessionToken = token;
      if(typeof(token) == 'object'){
        app.setLoggedInClass(true);
      } else {
        app.setLoggedInClass(false);
      }
    }catch(e){
      app.config.sessionToken = false;
      app.setLoggedInClass(false);
    }
  }
};

// Set (or remove) the loggedIn class from the body
app.setLoggedInClass = function(add){
  var target = document.querySelector("body");
  if(add){
    target.classList.add('loggedIn');
  } else {
    target.classList.remove('loggedIn');
  }
};

// Set the session token in the app.config object as well as localstorage
app.setSessionToken = function(token){
  app.config.sessionToken = token;
  var tokenString = JSON.stringify(token);
  localStorage.setItem('token',tokenString);
  if(typeof(token) == 'object'){
    app.setLoggedInClass(true);
  } else {
    app.setLoggedInClass(false);
  }
};

// Renew the token
app.renewToken = function(callback){
  var currentToken = typeof(app.config.sessionToken) == 'object' ? app.config.sessionToken : false;
  if(currentToken){
    // Update the token with a new expiration
    var payload = {
      'id' : currentToken.id,
      'extend' : true,
    };
    app.client.request(undefined,'api/tokens','PUT',undefined,payload,function(statusCode,responsePayload){
      // Display an error on the form if needed
      if(statusCode == 200){
        // Get the new token details
        var queryStringObject = {'id' : currentToken.id};
        app.client.request(undefined,'api/tokens','GET',queryStringObject,undefined,function(statusCode,responsePayload){
          // Display an error on the form if needed
          if(statusCode == 200){
            app.setSessionToken(responsePayload);
            callback(false);
          } else {
            app.setSessionToken(false);
            callback(true);
          }
        });
      } else {
        app.setSessionToken(false);
        callback(true);
      }
    });
  } else {
    app.setSessionToken(false);
    callback(true);
  }
};

// Loop to renew token often
app.tokenRenewalLoop = function(){
  setInterval(function(){
    app.renewToken(function(err){
      if(!err){
        console.log("Token renewed successfully @ "+Date.now());
      }
    });
  },1000 * 60);
};

// Load data on the page
app.loadDataOnPage = function(){
  // Get the current page from the body class
  var bodyClasses = document.querySelector("body").classList;
  var primaryClass = typeof(bodyClasses[0]) == 'string' ? bodyClasses[0] : false;

  // Logic for account settings page
  if(primaryClass == 'accountEdit'){
    app.loadAccountEditPage();
  }

  // Logic for shoppingItems page
  if(primaryClass == 'shoppingItems'){
    app.loadShoppingCart();
  }

  // Logic for successfulPage page
  if(primaryClass == 'successfulPage'){
    app.loadSuccessPage();
  }

};

// Load the account edit page specifically
app.loadAccountEditPage = function(){
  // Get the email from the current token, or log the user out if none is there
  var email = typeof(app.config.sessionToken.email) == 'string' ? app.config.sessionToken.email : false;
  if(email){
    // Fetch the user data
    var queryStringObject = {
      'email' : email
    };
    app.client.request(undefined,'api/users','GET',queryStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        // Put the data into the forms as values where needed
        document.querySelector("#accountEdit1 .firstNameInput").value = responsePayload.firstName;
        document.querySelector("#accountEdit1 .lastNameInput").value = responsePayload.lastName;
        document.querySelector("#accountEdit1 .displayEmailInput").value = responsePayload.email;
        document.querySelector("#accountEdit1 .adressInput").value = responsePayload.streetAddress;

        // Put the hidden email field into both forms
        var hiddenEmailInput = document.querySelectorAll("input.hiddenEmailInput");
        for(var i = 0; i < hiddenEmailInput.length; i++){
          hiddenEmailInput[i].value = responsePayload.email;
        }

      } else {
        // If the request comes back as something other than 200, log the user our (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

// Load the dashboard page specifically
app.loadShoppingCart = function(){
  // Get the e-mail from the current token, or log the user out if none is there
  var email = typeof(app.config.sessionToken.email) == 'string' ? app.config.sessionToken.email : false;
  if(email){
    // Fetch the user data
    var userStringObject = {
      'email' : email
    };
    //Get the user's shopping cart id
    app.client.request(undefined,'api/users','GET',userStringObject,undefined,function(statusCode,responsePayload){
      if(statusCode == 200){
        //Get the table DOM
        var table = document.getElementById('cartTable');
        // Determine how many checks the user has
        var cartId = responsePayload.shoppingCart;
        //create next queryString
        if(cartId){
          var cartStringObject = {
            'id':cartId
          }
        } else {
          // Show 'you have no items' message
          var noItems = '<tr class = "checkRow"><td>You haven\'t added anything to your cart!</td></tr>';
          table.insertAdjacentHTML('beforeend', noItems);
        }
        //Get the shopping cart data
        app.client.request(undefined,'api/shoppingcarts','GET',cartStringObject,undefined, function(CartstatusCode, cartData){
          //extract products
          var pizzas = cartData.pizzas;
          var drinks = cartData.drinks;
          var desserts = cartData.desserts;
          var items = pizzas.concat(drinks);
          items = items.concat(desserts);
          if(items.length > 0){
            var totalPay = 0;
            for(item of items){
              var row = app.populateCart(item);
              totalPay += row.value;
              table.insertAdjacentHTML('beforeend', row.html);
            }
            var totalHtml = `<tr><th>Total</th><td></td><td>${totalPay.toFixed(2)}</td></tr>`;
            table.insertAdjacentHTML('beforeend', totalHtml);
          } else {
            // Show 'you have no items' message
            var noItems = '<tr class = "checkRow"><td colspan="5">You haven\'t added anything to your cart!</td></tr>';
            table.insertAdjacentHTML('beforeend', noItems);
          }
          var cartId = cartData.cartId;
          var hiddenIdInput = `<input type= "hidden" name="shoppingCartId" value=${cartId}>`;
          var formOrder = document.getElementById("formOrder");
          formOrder.insertAdjacentHTML('afterbegin', hiddenIdInput);
        });
      } else {
        // If the request comes back as something other than 200, log the user out (on the assumption that the api is temporarily down or the users token is bad)
        app.logUserOut();
      }
    });
  } else {
    app.logUserOut();
  }
};

app.populateCart = function(obj){
  var ans = {}
  var keys = Object.keys(obj);
  var pop =
  `<tr class="checkRow">
      <td>${obj[keys[0]]}</td>
      <td>${keys[1]}</td>
      <td>${obj[keys[1]]}</td>
  </tr>`;
  ans.html = pop;
  ans.value = obj[keys[1]];
  return ans
}

// Load the dashboard page specifically
app.loadSuccessPage = function(){
  // Get the e-mail from the current token, or log the user out if none is there
  var email = typeof(app.config.sessionToken.email) == 'string' ? app.config.sessionToken.email : false;
  if(email){
    //Get the table DOM
    var titles = document.getElementById('title');
    var msg = `<h2>A Receipt Has Been Sent To<span style="color:blue; font-weight:bold"> ${email}</span></h2>`
    titles.insertAdjacentHTML('beforeend', msg);
  } else {
    app.logUserOut();
  }
};

// Init (bootstrapping)
app.init = function(){

  // Bind all form submissions
  app.bindForms();

  // Bind logout logout button
  app.bindLogoutButton();

  // Get the token from localstorage
  app.getSessionToken();

  // Renew token
  app.tokenRenewalLoop();

  // Load data on page
  app.loadDataOnPage();

};

// Call the init processes after the window loads
window.onload = function(){
  app.init();
};
