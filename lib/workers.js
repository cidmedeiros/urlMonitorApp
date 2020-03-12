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
    originalCheckData.originalCheckData.protocol =  typeof(data.payload.originalCheckData.protocol) == 'string' && ['http', 'https'].indexOf(data.payload.originalCheckData.protocol) > -1 ? data.payload.originalCheckData.protocol : false;
    originalCheckData.url =  typeof(data.payload.originalCheckData.url) == 'string' && data.payload.originalCheckData.url.trim().length > 0 ? data.payload.originalCheckData.url : false;
    originalCheckData.method =  typeof(data.payload.originalCheckData.method) == 'string' && ['post', 'get', 'put', 'delete'].indexOf(data.payload.originalCheckData.method) > -1 ? data.payload.originalCheckData.method : false;
    originalCheckData.successCodes =  typeof(data.payload.originalCheckData.successCodes) == 'object' && data.payload.originalCheckData.successCodes instanceof Array && data.payload.originalCheckData.successCodes.length > 0 ? data.payload.originalCheckData.successCodes : false;
    originalCheckData.timeoutSeconds =  typeof(data.payload.originalCheckData.timeoutSeconds) == 'number' && data.payload.originalCheckData.timeoutSeconds % 1 === 0 && data.payload.originalCheckData.timeoutSeconds >= 1 && data.payload.originalCheckData.timeoutSeconds <= 5 ? data.payload.originalCheckData.timeoutSeconds : false;
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