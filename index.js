/*
*Primary file for the API
*/
//Dependencies
const server = require('./lib/server');
const workers = require('./lib/workers');
const cli = require('./lib/cli');

//Declare the app

var app = {};

//Init function
app.init = () => {
    //Start the server
    server.init();

    //Start the workers
    workers.init();

    //Start the CLI, but make sure it starts last so worker can load up all the logs and other related data
    setTimeout(() => {
        cli.int();
    }, 50);

};

//Execute
app.init();

//Export the app
module.exports = app;