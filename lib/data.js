/* Library for storing and editing data */

//Dependencies
const fs = require('fs');
const path = require('path');

//Container for the module (to be exported)
let lib = {};

//Base directory of the data folder
//__dirname -> native nodejs variable that tracks in which folder the file is
lib.baseDir = path.join(__dirname, '/../.data/');

lib.create = (dir, file, data, callback) => {

};

//Export the module
module.exports = lib;