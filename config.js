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
    'hashingSecret': 'aVeryWeirdCreatureHere'
}

//define the production enviroment
environments.production = {
    'httpPort': 5000,
    'httpsPort': 5001,
    'envName' : 'production',
    'hashingSecret': 'anotherVeryWeirdCreatureHere'
}

//Determine which environment was passed as a command-line argument
let currentEnv = (typeof process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

//Determine which environment to export
let toExportEnv = (typeof environments[currentEnv]) == 'object' ? environments[currentEnv] : environments.staging;

//Export the determined ENV
module.exports = toExportEnv;
