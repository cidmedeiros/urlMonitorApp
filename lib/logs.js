/* Library for sotring and rotating logs */

//Dependecies
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

//Container for the module
let logSchreiber = {};

//Base dir for logs
logSchreiber.baseDir = path.join(__dirname, '/../.logs/');

//Append a string to a file. Create a new file if it doesn't exist
logSchreiber.append = (file, str, callback) =>{
    //Open the appending file
    fs.open(logSchreiber.baseDir+file+'.log', 'a', (err, fileDescriptor) => {
        if(!err){
            //Append to the file and close it
            fs.appendFile(fileDescriptor, str+'\n', (err) =>{
                if(!err){
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            callback(false, 'Log appending ok!');
                        } else {
                            callback({'Error closing the file': err});
                        }
                    });
                } else {
                    callback({'Error appending to the file:': err})
                }
            });
        } else {
            callback({'Could not open the file log for appending': err});
        }
    });
};


//Export the module
module.exports = logSchreiber;