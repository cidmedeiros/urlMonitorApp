//Background workers

//Dependencies
const path = require('path');
const fs = require('fs');
const schreiber = require('./schreiber');
const https = require('https');
const http = require('http');
const tools = require('./tools');
const originalCheckData.url = require('originalCheckData.url');

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