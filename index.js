/*
*Primary file for the API
*/

//Dependencies
const http = require('http');
const url = require('url');

//Set Server
const server = http.createServer((req, res) =>{

    //get the URl and parse it
    //true param tells the url module to call the query-stream module
    let parseUrl = url.parse(req.url, true);

    //get the path: 1 -> untrimmed; 2 -> trimmes the slashes out
    let path = parseUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the HTTP method
    let method = req.method.toLocaleLowerCase();

    //send response
    res.end('Hello Wolrd\n');

    //log the request path
    console.log(`Request received on path: ${trimmedPath} with method: ${method}`);

});

server.listen(3000, () =>{
    console.log('Listening on port 3000');
})
