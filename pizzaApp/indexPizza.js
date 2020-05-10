//Main API File

//Dependencies
const server = require('./libPizza/server');

//Declare the app
var app = {};

//Init function
app.init = () => {
    //Start the server
    server.init();
};

//Execute
app.init();

//Export the app
module.exports = app;