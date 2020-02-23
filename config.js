/* Create and export configuration variables */

//Container for all the environments

let environments = {}

//define the staging enviroment (default)
environments.staging = {
    'port': 3000,
    envName = 'staging'
}

//define the production enviroment
environments.staging = {
    'port': 5000,
    envName = 'production'
}

//Determine which environment was passed as a command-line argument
let currentEnv = (typeof process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLocaleLowerCase() : '';

//Determine which environment to export
let toExportEnv = (typeof currentEnv) == 'object' ? environments[currentEnv] : environments.staging;

//Export the determined ENV
module.exports = toExportEnv;
