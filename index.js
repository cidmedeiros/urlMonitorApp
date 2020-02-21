/*
*Primary file for the API
*/

//Dependencies
const http = require('http');
const url = require('url');
const StringDecoder = require('string_decoder').StringDecoder;

//Set Server
const server = http.createServer((req, res) =>{

    //get the URl and parse it
    //true param tells the url module to call the query-stream module
    let parseUrl = url.parse(req.url, true);

    //get the path: 1 -> untrimmed; 2 -> trimmes the slashes out
    let path = parseUrl.pathname;
    let trimmedPath = path.replace(/^\/+|\/+$/g, '');

    //get the query string as an object
    //ex: localhost:3000/foo/nigh/?fizz=buzz
    //query -> { fizz: 'buzz' }
    let queryStringObject = parseUrl.query;

    //get the HTTP method
    let method = req.method.toLocaleLowerCase();

    //get the headers as an object
    let headers = req.headers

    //get the payload, if any
    let decoder = new StringDecoder('utf-8');
    let buffer = '';
    //on means event emitter (stream of data). The name of the event is data
    req.on('data', (data) =>{
        buffer += decoder.write(data);
    });

    req.on('end', () =>{
        buffer += decoder.end();
        //send response
        res.end('Hello Wolrd\n');

        //log the request path
        console.log(`Request received on path: ${trimmedPath} with method: ${method} with query params:`, queryStringObject);
        console.log(`These are the requests headers: ${headers}`);
        });
        console.log(`This is the payload: ${buffer}`);
        });

});

server.listen(3000, () =>{
    console.log('Listening on port 3000');
})
