/* 
* CLI-Related Tasks
 */

 //Dependencies
 const readline = require('readline');
 const util = require('util');
 const debug = util.debuglog('cli');
 const events = require('events');
 class _events extends events{};
 const e = new _events();

 //Instantiate the CLI module object
var cli = {};

// Input processor
cli.processInput = function(str){
    //Sanitize input
    str = typeof(str) == 'String' && str.trim().length > 0 ? str.trim() : false;
    //Only process the input if the user actually wrote something. Otherwise ignore it
    if(str){
        // Codify the unique strings that identify the unique questions allowed to be asked
        var uniqueInputs = [
            'man',
            'help',
            'exit',
            'stats',
            'list users',
            'more user info',
            'list checks',
            'more check info',
            'list logs',
            'more log info'
        ];

        //Go through the possible inputs, emit an event when a match is found
        var matchFound = False;
        var counter = 0;
        uniqueInputs.some((input) =>{
            if(str.toLowerCase().indexOf(input) > -1){
                matchFound = true;
                // Emit an event matching the unique input
                e.emit(input, str);
                return true;
            }
        });

        //if no match is found, tell the user to try again
        if(!matchFound){
            console.log('Sorry, try again');
        }
    }
};

//Init Script
cli.init = function(){
    //Send the start message to the console, in dark blue
    console.log('\x1b[34m%s\x1b[0m', "The CLI is running");

    //Start the interface
    var _interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: ''
    });

    //Create an initial prompt
    _interface.prompt();

    //handle each line of input separately
    _interface.on('line', ()=>{
        //Send to the input processor
        cli.processInput(str);

        //Re-initialize the prompt afterwards
        _interface.prompt();

        //if the users stops the CLI, kill the associated process
        _interface.on('close', ()=>{
            process.exit(0);
        })
    })
}











 //Export the module
 module.exports = cli;
