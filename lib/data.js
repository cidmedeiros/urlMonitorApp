/* Library for storing and editing data */

//Dependencies
const fs = require('fs');
const path = require('path');

//Container for the module (to be exported)
let lib = {};

//Base directory of the data folder
//__dirname -> native nodejs variable that tracks in which folder the file is
lib.baseDir = path.join(__dirname, '/../.data/');

//Create a file and write data to it
lib.create = (dir, file, data, callback) => {
    //'wx' is one of many flags provided by the fs open method 
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
        if(!err && fileDescriptor){
            //convert the data to string
            dataString = JSON.stringify(data);
            //Write the dataString to file
            fs.write(fileDescriptor, dataString, (err) => {
                if(!err){
                    fs.close(fileDescriptor, (err) => {
                        if(!err){
                            callback(200, {'message':'Success writing the file!'});
                        } else{
                            callback(500, {'message':'Error closing the file'});
                        }
                    });
                } else {
                    callback(500, {'message':'Error writing the file'});
                }
            });
        } else{
            callback(500, {'message':'Could not create new file, it may already exist'});
        }
    });
};

//read data from file
lib.read = (dir, file, callback) => {
    fs.readFile(`${lib.baseDir}${dir}/${file}.json`,'utf-8', (err, data) => {
        callback(err, data);
    });
};

//Update data inside a file
lib.update = (dir, file, data, callback) => {
    //open the file for writting
    fs.open(`${lib.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) =>{
        if(!err && fileDescriptor){
            let stringData = JSON.stringify(data);
            //Truncate the file 
            fs.truncate(fileDescriptor, (err) =>{
                if(!err) {
                    fs.write(fileDescriptor,stringData, (err) => {
                        if(!err){
                            fs.close(fileDescriptor, (err) => {
                                if(!err){
                                    callback('Success!');
                                } else {
                                    callback('This is the error closing the file:', err);
                                }
                            });
                        } else {
                            callback('This is the error writing the file:', err);
                        }
                    });
                } else {
                    callback('This is the error truncating the file:', err);
                }
            });
        } else {
            callback('Could not open the file for updating, the file may not exist yet', err);
        }
    });
};

//Delete a file
lib.delete = (dir, file, callback) => {
    //unlink the file from the system
    fs.unlink(`${lib.baseDir}${dir}/${file}.json`, (err) => {
        if(!err) {
            callback('Success deleting the file!');
        } else {
            callback('Error deleting the file:', err);
        }
    });
};

//Export the module
module.exports = lib;