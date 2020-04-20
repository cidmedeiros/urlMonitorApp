/* Library for storing and editing data */

//Dependencies
const fs = require('fs');
const path = require('path');
const tools = require('./tools');

//Container for the module (to be exported)
let schreiber = {};

//Base directory of the data folder
//__dirname -> native nodejs variable that tracks in which folder the file is
schreiber.baseDir = path.join(__dirname, '/../.data/');

//Create a file and write data to it
schreiber.create = (dir, file, data, callback) => {
    //'wx' is one of many flags provided by the fs open method 
    fs.open(`${schreiber.baseDir}${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
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

//Read data from a file
schreiber.read = (dir,file,callback) => {
    fs.readFile(schreiber.baseDir+dir+'/'+file+'.json', 'utf8', (err,data) => {
        if(!err && data){
            var parsedData = tools.parseJsonToObject(data);
            callback(false,parsedData);
        } else {
            callback(err,data);
        }
    });
};

//Update data inside a file
schreiber.update = (dir, file, data, callback) => {
    //open the file for writting
    fs.open(`${schreiber.baseDir}${dir}/${file}.json`, 'r+', (err, fileDescriptor) =>{
        if(!err && fileDescriptor){
            let stringData = JSON.stringify(data);
            //Truncate the file 
            fs.ftruncate(fileDescriptor, (err) =>{
                if(!err) {
                    fs.write(fileDescriptor,stringData, (err) => {
                        if(!err){
                            fs.close(fileDescriptor, (err) => {
                                if(!err){
                                    callback(200, {'message:':'Update ok!'});
                                } else {
                                    callback(500, {'This is the error closing the file:':err});
                                }
                            });
                        } else {
                            callback(500, {'This is the error writing the file:': err});
                        }
                    });
                } else {
                    callback(500, {'This is the error truncating the file:': err});
                }
            });
        } else {
            callback(500, {'Could not open the file for updating, the file may not exist yet': err});
        }
    });
};

//Delete a file
schreiber.delete = (dir, file, callback) => {
    //unlink the file from the system
    fs.unlink(`${schreiber.baseDir}${dir}/${file}.json`, (err) => {
        if(!err) {
            callback(200, {'message':'Success deleting the file!'});
        } else {
            callback(500, {'Error deleting the file': err});
        }
    });
};

//list all the items in a directory
schreiber.list = (dir, callback) => {
    fs.readdir(`${schreiber.baseDir}${dir}/`, (err, data)=>{
        if(!err && data && data.length > 0){
            let trimmedFileNames = [];
            data.forEach((fileName) => {
                trimmedFileNames.push(fileName.replace('.json', ''));
            });
            callback(false, trimmedFileNames);
        } else {
            callback(err, data);
        }
    });
}

//Export the module
module.exports = schreiber;