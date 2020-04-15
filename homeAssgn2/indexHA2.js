//Main API File

//Dependencies
const server = require('./serverHA2');

//Declare the app
var app = {};

//Init function
app.init = () => {
    //Start the server
    server.init();
};

//Execute
app.init();
