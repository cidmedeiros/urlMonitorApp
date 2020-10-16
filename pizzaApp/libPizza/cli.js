/*
 * CLI-related tasks
*/

// Dependencies
const readline = require('readline');
const util = require('util');
const debug = util.debuglog('cli');
const events = require('events');
class _events extends events{};
const e = new _events();
const schreiber = require('./schreiber');
const tools = require('./tools');

// Instantiate the cli module object
var cli = {};

// Input handlers
e.on('man',function(str){
  cli.responders.help();
});
  
e.on('help',function(str){
  cli.responders.help();
});
  
e.on('exit',function(str){
  cli.responders.exit();
});
  
e.on('menu',function(str){
  cli.responders.menu();
});
  
e.on('list users',function(str){
  cli.responders.listOrders();
});
  
e.on('more user info',function(str){
  cli.responders.moreOrderInfo(str);
});
  
e.on('list checks',function(str){
  cli.responders.listUsers(str);
});
  
e.on('more check info',function(str){
  cli.responders.moreUserInfo(str);
});
  
// Responders object
cli.responders = {};

// Help / Man
cli.responders.help = function(){
  // Codify the commands and their explanations
  var commands = {
    'exit' : 'Kill the CLI (and the rest of the application)',
    'man' : 'Show this help page',
    'help' : 'Alias of the "man" command',
    'menu' : 'View all the current menu items',
    'List orders' : 'View all the recent orders in the system',
    'More order info --{orderId}' : 'Lookup the details of a specific order by order ID',
    'List users' : 'View all the users who have signed up in the last 24 hours',
    'More user info --{userEmail}' : 'Lookup the details of a specific user by email address',
  };

  // Show a header for the help page that is as wide as the screen
  cli.horizontalLine();
  cli.centered('CLI MANUAL');
  cli.horizontalLine();
  cli.verticalSpace(2);

  // Show each command, followed by its explanation, in white and yellow respectively
  for(var key in commands){
    var value = commands[key];
    var line = '\x1b[33m'+key+'\x1b[0m';
    var padding = 60 - line.length;
    for(var i = 0; i < padding; i++){
      line+=' ';
    }
    line+= value;
    console.log(line);
    cli.verticalSpace();
  }
  cli.verticalSpace();

  // End with another horizontal line
  cli.horizontalLine();
};

// Exit
cli.responders.exit = function(){
  process.exit(0);
};

// Stats
cli.responders.menu = function(){
  // Create a header for the stats
  cli.horizontalLine();
  cli.centered('CURRENT MENU');
  cli.horizontalLine();
  cli.verticalSpace();
  // Fetch the menu object
  schreiber.read('menu', 'menu', (err, menu) =>{
    if(!err && menu){
      // Show each option, followed by its price, in white and yellow respectively
      for(var category in menu){
        var ArrayOptions = menu[category];
        cli.centered(category.toUpperCase());
        ArrayOptions.forEach((option) =>{ 
          for(key in option){
            if(option.hasOwnProperty(key)){
              value = option[key];
              var line = '\x1b[33m'+key+'\x1b[0m';
              var padding = 40 - line.length;
              for(var i = 0; i < padding; i++){
                line+=' ';
              }
              line+= value;
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
        cli.horizontalLine();
      }
  cli.verticalSpace();
  // Create a footer for the stats
  cli.verticalSpace();
    }
  });
};

// List Orders
cli.responders.listOrders = function(str){
  schreiber.list('checks',function(err,checkIds){
    if(!err && checkIds && checkIds.length > 0){
      cli.verticalSpace();
      checkIds.forEach(function(checkId){
        schreiber.read('checks',checkId,function(err,checkData){
          if(!err && checkData){
            var includeCheck = false;
            var lowerString = str.toLowerCase();
            // Get the state, default to down
            var state = typeof(checkData.state) == 'string' ? checkData.state : 'down';
            // Get the state, default to unknown
            var stateOrUnknown = typeof(checkData.state) == 'string' ? checkData.state : 'unknown';
            // If the user has specified that state, or hasn't specified any state
            if((lowerString.indexOf('--'+state) > -1) || (lowerString.indexOf('--down') == -1 && lowerString.indexOf('--up') == -1)){
              var line = 'ID: '+checkData.id+' '+checkData.method.toUpperCase()+' '+checkData.protocol+'://'+checkData.url+' State: '+stateOrUnknown;
              console.log(line);
              cli.verticalSpace();
            }
          }
        });
      });
    }
  });
};

// More order info
cli.responders.moreOrderInfo = function(str){
  // Get ID from string
  var arr = str.split('--');
  var checkId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if(checkId){
    // Lookup the user
    schreiber.read('checks',checkId,function(err,checkData){
      if(!err && checkData){

        // Print their JSON object with text highlighting
        cli.verticalSpace();
        console.dir(checkData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }
};

// List Users
cli.responders.listUsers = function(){
  schreiber.list('users',function(err,userIds){
    if(!err && userIds && userIds.length > 0){
      cli.verticalSpace();
      userIds.forEach(function(userId){
        schreiber.read('users',userId,function(err,userData){
          if(!err && userData){
            var line = 'Name: '+userData.firstName+' '+userData.lastName+' Phone: '+userData.phone+' Checks: ';
            var numberOfChecks = typeof(userData.checks) == 'object' && userData.checks instanceof Array && userData.checks.length > 0 ? userData.checks.length : 0;
            line+=numberOfChecks;
            console.log(line);
            cli.verticalSpace();
          }
        });
      });
    }
  });
};

// More user info
cli.responders.moreUserInfo = function(str){
  // Get ID from string
  var arr = str.split('--');
  var userId = typeof(arr[1]) == 'string' && arr[1].trim().length > 0 ? arr[1].trim() : false;
  if(userId){
    // Lookup the user
    schreiber.read('users',userId,function(err,userData){
      if(!err && userData){
        // Remove the hashed password
        delete userData.hashedPassword;

        // Print their JSON object with text highlighting
        cli.verticalSpace();
        console.dir(userData,{'colors' : true});
        cli.verticalSpace();
      }
    });
  }
};

// Create a vertical space
cli.verticalSpace = function(lines){
  lines = typeof(lines) == 'number' && lines > 0 ? lines : 1;
  for (i = 0; i < lines; i++) {
      console.log('');
  }
};

// Create a horizontal line across the screen
cli.horizontalLine = function(){

  // Get the available screen size
  var width = process.stdout.columns;

  // Put in enough dashes to go across the screen
  var line = '';
  for (i = 0; i < width; i++) {
      line+='-';
  }
  console.log(line);
};

// Create centered text on the screen
cli.centered = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : '';

  // Get the available screen size
  var width = process.stdout.columns;

  // Calculate the left padding there should be
  var leftPadding = Math.floor((width - str.length) / 2);

  // Put in left padded spaces before the string itself
  var line = '';
  for (i = 0; i < leftPadding; i++) {
      line+=' ';
  }
  line+= str;
  console.log(line);
};

// Input processor
cli.processInput = function(str){
  str = typeof(str) == 'string' && str.trim().length > 0 ? str.trim() : false;
  // Only process the input if the user actually wrote something, otherwise ignore it
  if(str){
    // Codify the unique strings that identify the different unique questions allowed be the asked
    var uniqueInputs = [
      'man',
      'help',
      'exit',
      'menu',
      'list orders',
      'more order info',
      'list users',
      'more user info',
    ];

    // Go through the possible inputs, emit event when a match is found
    var matchFound = false;
    var counter = 0;
    uniqueInputs.some((input) =>{
      if(str.toLowerCase().indexOf(input) > -1){
        matchFound = true;
        // Emit event matching the unique input, and include the full string given
        e.emit(input,str);
        return true;
      }
    });

    // If no match is found, tell the user to try again
    if(!matchFound){
      console.log("Sorry, try again");
    }

  }
};

// Init script
cli.init = function(){

  // Send to console, in dark blue
  console.log('\x1b[34m%s\x1b[0m','The CLI is running');

  // Start the interface
  var _interface = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });

  // Create an initial prompt
  _interface.prompt();

  // Handle each line of input separately
  _interface.on('line', function(str){
    // Send to the input processor
    cli.processInput(str);

    // Re-initialize the prompt afterwards
    _interface.prompt();
  });

  // If the user stops the CLI, kill the associated process
  _interface.on('close', () =>{
    process.exit(0);
  });

};

// Export the module
module.exports = cli;