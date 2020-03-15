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

//List all the logs, optionally include the compressed files
logSchreiber.list = (includeCompressedLogs, callback) => {
    fs.readdir(logSchreiber.baseDir, (err, data) => {
        if(!err){
            let trimmedFileNames = [];
            data.forEach((fileName) => {
                //add .log file
                if(fileName.indexOf('.log') > -1){
                    trimmedFileNames.push(fileName.replace('.log', ''));
                }
                //add .gz compressed files
                if(fileName.indexOf('.gz.b64') > -1 && includeCompressedLogs){
                    trimmedFileNames.push(fileName.replace('.gz.b64', ''));
                }
            });
            callback(false, trimmedFileNames);
        } else {
            callback(`Error reading logs directory: ${err}`);
        }
    });
};

//Export the module
module.exports = logSchreiber;