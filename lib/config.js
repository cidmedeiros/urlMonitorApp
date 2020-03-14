/* Create and export configuration variables
Attention: the command line to specify Env when init server is: NODE_ENV=modeName node fileName
 */

//Container for all the environments

let environments = {}

//define the staging enviroment (default)
environments.staging = {
    'httpPort': 3000,
    'httpsPort': 3001,
    'envName' : 'staging',
    'hashingSecret': 'aVeryWeirdCreatureHere',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid': 'ACb32d411ad7fe886aac54c665d25e5c5d',
        'authToken': '9455e3eb3109edc12e3d8c92768f7a67',
        'fromPhone': '+15005550006'
    }
};

//define the production enviroment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName' : 'production',
    'hashingSecret': 'anotherVeryWeirdCreatureHere',
    'maxChecks' : 5,
    'twilio' : {
        'accountSid': '',
        'authToken': '',
        'fromPhone': ''
    }
}

//Determine which environment was passed as a command-line argument
let currentEnv = (typeof process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

//Determine which environment to export
let toExportEnv = (typeof environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

//Export the determined ENV
module.exports = toExportEnv;
