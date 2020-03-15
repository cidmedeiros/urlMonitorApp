//Background workers

//Dependencies
const path = require('path');
const fs = require('fs');
const schreiber = require('./schreiber');
const https = require('https');
const http = require('http');
const tools = require('./tools');
const url = require('url');
const logSchreiber = require('./logs');
const util = require('util');
const debug = util.debuglog('workers'); //to monitor the workers module -> NODE_DEBUG=workers node index.js

/* Overall pipeline route:
gatherAllChecks -> validateCheckData -> performCheck -> processCheckOutcome -> alertUserToStatusChange
*/

//Instantiate the worker object
let workers = {};

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = function(){
    // Get all the checks
    schreiber.list('checks',function(err,checks){
      if(!err && checks && checks.length > 0){
        checks.forEach(function(check){
          // Read in the check data
          schreiber.read('checks',check, (err,originalCheckData) =>{
            if(!err && originalCheckData){
              // Pass it to the check validator, and let that function continue the function or log the error(s) as needed
              workers.validateCheckData(originalCheckData);
            } else {
              debug("Error reading one of the check's data: ",err);
            }
          });
        });
      } else {
        debug('Error: Could not find any checks to process');
      }
    });
};

//Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {
    originalCheckData = typeof(originalCheckData) == 'object' & originalCheckData.length !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
    originalCheckData.phone = typeof(originalCheckData.userPhone) == 'string' && originalCheckData.userPhone.trim().length == 10 ? originalCheckData.userPhone.trim() : false;
    originalCheckData.protocol =  typeof(originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url =  typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url : false;
    originalCheckData.method =  typeof(originalCheckData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes =  typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds =  typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    //Set the keys to track check's state
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData : 'down'
    //Timestamp for the last check on the url
    originalCheckData.lastChecked =  typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked % 1 === 0 ? originalCheckData.lastChecked : false;

    if(originalCheckData.id &&
       originalCheckData.phone &&
       originalCheckData.protocol &&
       originalCheckData.url &&
       originalCheckData.method &&
       originalCheckData.successCodes &&
       originalCheckData.timeoutSeconds){
           workers.performCheck(originalCheckData);
    } else {
        debug('Error one of the checks is not properly formatted. Skipping it.')
    }
};

/* It crafts the request parameters. It Performs the check by sending the server request, send the originalCheckData and the outcome of the check process to the next step. */
workers.performCheck = (originalCheckData) =>{
    //prepare the initial check outcome
    let checkOutcome = {
        'error': false,
        'responseCode': false
    };

    //mark that the outcome has not been sent yet
    let outcomeSent = false;

    //parse the hostname and the path out of the original check data
    let parsedUrl = url.parse(originalCheckData.protocol+'://'+originalCheckData.url, true);
    let hostName = parsedUrl.hostname;
    let path = parsedUrl.path; //using path and not using pathname because we want the whole query string

    //Construct the request
    let requestDetails = {
        'protocol' : originalCheckData.protocol+':',
        'hostname' : hostName,
        'method' : originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    };

    //Instantiate the request object (using either the http or https module)
    var _moduleToUse = originalCheckData.protocol == 'http' ? http : https;
    var req = _moduleToUse.request(requestDetails, (res) =>{
        //Grab the status of the sent request
        let status = res.statusCode;
        //Update the checkOutcome and pass the data along
        checkOutcome.responseCode = status;
        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    //Bind to the error event so it doesn't get thrown
    req.on('error', (e) => {
        //Update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value' : e
        };
        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });

    //Bind to the timeout event so it doesn't get thrown
    req.on('timeout', (e) => {
        //Update the checkOutcome and pass the data along
        checkOutcome.error = {
            'error': true,
            'value' : 'timeout'
        };
        if(!outcomeSent){
            workers.processCheckOutcome(originalCheckData, checkOutcome);
            outcomeSent = true;
        }
    });
    
    //End the request (which it's actually sending the request)
    req.end();
};

/* -> Process the checkOutcome, update the check data as needed, trigger an alert to the user if needed
-> Special logic for accomodating a check that has never been tested before (don't alert on that one)*/
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
    //Decide if the check is considered up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1 ? 'up' : 'down';
    let response = checkOutcome.responseCode

    //Decide if an alert is warranted
    let alertWarranted = originalCheckData.lastChecked && originalCheckData.state !== state ? true : false;

    //Update the check data
    let newCheckData = originalCheckData;
    newCheckData.state = state;
    newCheckData.lastChecked = Date.now();

    //Log app processes
    let timeOfCheck = Date.now();
    workers.log(originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck);

    //Save the updates
    schreiber.update('checks', newCheckData.id, newCheckData, (err) => {
        if(!err || err === 200){
            //Send the check data to the next phase of process if needed
            if(alertWarranted){
                workers.alertUserToStatusChange(newCheckData, response);
            } else {
                debug('No alert is needed!');
            }
        } else {
            debug(`Error trying to update check${newCheckData.id}`, err);
        }
    });
};

workers.alertUserToStatusChange = (newCheckData, response) => {
    let msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${newCheckData.protocol}://${newCheckData.url} is currently ${newCheckData.state}.`

    tools.sendTwilioSms(newCheckData.userPhone, msg, (err) => {
        if(!err){
            debug(`Alert to user ${newCheckData.userPhone} regarding ${newCheckData.url} successfully delivered! Current Status: ${newCheckData.state}. Current response: ${response}`);
        } else{
            debug(`Error: could not send sms to user ${newCheckData.userPhone} who had a status changed regarding ${newCheckData.url}. Current Status: ${newCheckData.state}. Current response: ${response} Messaging server error log: ${err}`);
        }
    })
}

//Define Log file function
workers.log = (originalCheckData, checkOutcome, state, alertWarranted, timeOfCheck) => {
    let logData = {
        'check' : originalCheckData,
        'outcome': checkOutcome,
        'state': state,
        'alert': alertWarranted,
        'time': timeOfCheck
    };

    //Cast to string
    let logString = JSON.stringify(logData);

    //Determine the name of the log file
    let logFileName = originalCheckData.id;

    //Append the logstring to the file
    logSchreiber.append(logFileName,logString, (err) => {
        if(!err){
            debug('Logging to file succeeded!');
        } else {
            debug('Logging to file failed!');
        }
    });
};

//Rotate ( aka compress) the logs files
workers.rotateLogs = () =>{
    //list all the non compressed log files
    logSchreiber.list(false, (err, logs) => {
        if(!err && logs && logs.length > 0){
            logs.forEach((logName) => {
                //compress the data to a different file
                let logId = logName.replace('.log', '');
                let newFileId = logId+'-'+Date.now();
                logSchreiber.compress(logId, newFileId, (err) =>{
                    if(!err){
                        //truncate the log
                        logSchreiber.truncate(logId, (err) => {
                            if(!err){
                                debug('Success truncating logFile');
                            } else {
                                debug('Error truncating logFile');
                            }
                        });
                    } else {
                        debug('Error compressing one of the log files', err);
                    }
                });
            });
        } else {
            debug('Error: could not find any logs to rotate.')
        }
    });
}

//Timer to execute the worker-process once per minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 5);
};

//Timer to execute the log-rotation once per day
workers.logRotationLoop = () => {
    setInterval(() =>{
        workers.rotateLogs();
    }, 1000 * 60 * 60 * 24);
};

//Init script
workers.init = () => {
    //Inform the console in yellow
    console.log('\x1b[33m%s\x1b[0m', 'Background workers are running');

    //Execute all the checks immediately
    workers.gatherAllChecks();

    //Call the loop so the checks will execute later on
    workers.loop();

    //Compress all the logs immediately 
    workers.rotateLogs();

    //Call the compression loop so logs will be compressed later on
    workers.logRotationLoop();
};

//Export the module
module.exports = workers;