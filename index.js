/*
*Primary file for the API
*/

//Dependencies
const http = require('http');

//Set Server
const server = http.createServer((req, res) =>{
    res.end('Hello Wolrd\n');
});

server.listen(3000, () =>{
    console.log('Listening on port 3000');
})
