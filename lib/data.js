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
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            //convert the data to string
            dataString = JSON.stringify(data);
            //Write the dataString to file
            fs.write(fileDescriptor, dataString, (err) => {
                if(!err){
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            callback('Success!');
                        } else{
                            callback('Error closing the file');
                        }
                    });
                }
            });
        } else{
            callback('Could not create new file, it may already exist');
        }
    });
};

//Export the module
module.exports = lib;