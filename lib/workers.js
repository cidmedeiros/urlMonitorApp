//Background workers

//Dependencies
const path = require('path');
const fs = require('fs');
const schreiber = require('./schreiber');
const https = require('https');
const http = require('http');
const tools = require('./tools');
var originalCheckData = require('originalCheckData.url');

//Instantiate the worker object
let workers = {};

//Looup all checks, get their data, send to a validator
workers.gatherAllChecks = () =>{
    //Get all the checks
    schreiber.list('checks', (err, checks) => {
        if(!err && checks && checks.length > 0){
            checks.forEach((check) =>{
                //read in the check data
                schreiber.read('checks', check, (err, originalCheckData) =>{
                    if(!err & originalCheckData){
                        //pass it to the check validator, and let the func continue or kepp logging errors as it goes
                    }else {
                        console.log('Error reading one of the checks\'s data!')
                    }
                })
            })
        }else {
            console.log('Error: Could no find any checks to process');
        }
    })
}

//Sanity-check the check-data
workers.validateCheckData = (originalCheckData) => {
    originalCheckData = typeof(originalCheckData) == 'object' & originalCheckData.length !== null ? originalCheckData : {};
    originalCheckData.id = typeof(originalCheckData.id) == 'string' && originalCheckData.id.trim().length == 20 ? originalCheckData.id.trim() : false;
    originalCheckData.phone = typeof(originalCheckData.phone) == 'string' && originalCheckData.phone.trim().length == 10 ? originalCheckData.phone.trim() : false;
    originalCheckData.protocol =  typeof(originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(originalCheckData.protocol) > -1 ? originalCheckData.protocol : false;
    originalCheckData.url =  typeof(originalCheckData.url) == 'string' && originalCheckData.url.trim().length > 0 ? originalCheckData.url : false;
    originalCheckData.method =  typeof(originalCheckData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(originalCheckData.method) > -1 ? originalCheckData.method : false;
    originalCheckData.successCodes =  typeof(originalCheckData.successCodes) == 'object' && originalCheckData.successCodes instanceof Array && originalCheckData.successCodes.length > 0 ? originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds =  typeof(originalCheckData.timeoutSeconds) == 'number' && originalCheckData.timeoutSeconds % 1 === 0 && originalCheckData.timeoutSeconds >= 1 && originalCheckData.timeoutSeconds <= 5 ? originalCheckData.timeoutSeconds : false;

    //Set the keys to track check's state
    originalCheckData.state = typeof(originalCheckData.state) == 'string' && ['up', 'down'].indexOf(originalCheckData.state) > -1 ? originalCheckData : 'down'
    //Timestamp for the last check on the url
    originalCheckData.lastChecked =  typeof(originalCheckData.lastChecked) == 'number' && originalCheckData.lastChecked % 1 > 0 ? originalCheckData.lastChecked : false;

    if(originalCheckData.id &&
       originalCheckData.phone &&
       originalCheckData.protocol &&
       originalCheckData.method &&
       originalCheckData.successCodes &&
       originalCheckData.timeoutSeconds){
           workers.performCheck(originalCheckData);
    } else {
        console.log('Error one of the checks is not properly formatted. Skipping it.')
    }
};

//Perform the check, send the originalCheckData and the outcome of the check process to the next step
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
    let path = parsedUrl.path; //using path and not pathname because we want the whole query string

    //Construct the request
    let requestDetails = {
        'protocol' : originalCheckData.protocol+':',
        'hostname' : hostName,
        'method' : originalCheckData.method.toUpperCase(),
        'path': path,
        'timeout': originalCheckData.timeoutSeconds * 1000
    };

    //Instantiate the request object (using either the http or https module)
    var _moduleToUse = originalCheckData.protocol == 'http' ? http : htpps;
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
    
    //End the request (send the request)
    req.end();
};

//process the checkOutcome, update the check as needed, trigger an alert to the user if needed
//Special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = (originalCheckData, checkOutcome) => {
    //Decide if the check is considered up or down
    let state = !checkOutcome.error && checkOutcome.responseCode && originalCheckData
}

//Timer to execute the worker-process once per minute
workers.loop = () => {
    setInterval(() => {
        workers.gatherAllChecks();
    }, 1000 * 60);
};

//Init script
workers.init = () => {
    //Execute all the checks immediately
    workers.gatherAllChecks();

    //Call the loop so the checks will execute later on
    workers.loop();
};

//Export the module
module.exports = workers;