/* Create and export configuration variables
Attention: the command line to specify Env when init server is: NODE_ENV=modeName node fileName
 */

//Container for all the environments

let environments = {}

//define the staging enviroment (default)
environments.staging = {
    'httpsPort': 3000,
    'envName' : 'staging',
    'hashingSecret': 'aVeryWeirdCreatureHere',
    'stripeInfo':{
        'stripeKey': '',
        'card': ['tok_visa', 'tok_mastercard']
    },
    'mailGunInfo':{
        'mailgunKey':'',
        'from': ''
    },
    'templateGlobals':{
        'appName': 'Pizza Fast',
        'companyName': 'Pizza Fast',
        'yearCreated': 2020,
        'baseUrl': 'https://localhost:3000'
    }
};

//define the production enviroment
environments.production = {
    'httpsPort': 5001,
    'envName' : 'production',
    'hashingSecret': 'anotherVeryWeirdCreatureHere',
    'stripeInfo':{
        'stripeKey': '',
        'card': ['tok_visa', 'tok_mastercard']
    },
    'mailGunInfo':{
        'mailgunKey':'',
        'from': ''
    },
    'templateGlobals':{
        'appName': 'Pizza Fast',
        'companyName': 'Pizza Fast',
        'yearCreated': 2020,
        'baseUrl': 'https://localhost:3000'
    }
}

//Determine which environment was passed as a command-line argument
let currentEnv = (typeof process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

//Determine which environment to export
let toExportEnv = (typeof environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

//Export the determined ENV
module.exports = toExportEnv;
