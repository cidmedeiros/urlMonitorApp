//Main API File

//Dependencies
const server = require('./libPizza/server');
const cli = require('./libPizza/cli');

//Declare the app
var app = {};

//Init function
app.init = () => {
    //Start the server
    server.init();
    //Start the CLI, but make sure it starts last so worker can load up all the logs and other related data
    setTimeout(() => {
        cli.init();
    }, 50);
};

//Execute
app.init();

//Export the app
module.exports = app;