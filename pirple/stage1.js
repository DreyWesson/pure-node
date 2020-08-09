const http = require("http");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;

// Creating the server
let server = http.createServer();

// Get the server to respond to request
server.on("request", (req, res) => {
  // Get url and parse it
  let parsedUrl = url.parse(req.url, true);

  // get the path
  let path = parsedUrl.pathname;
  let trimPath = path.replace(/^\/+|\/+$/g, "");

  // Get query string as an object
  let queryStringObj = parsedUrl.query;
  queryStringObj = JSON.stringify(queryStringObj);

  // Get the Headers as an object
  let reqHeader = JSON.stringify(req.headers, null, 5);

  // Get Payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();

    // Send the response
    res.end("Hello world\n");
    // Log request path
    console.log(`
    Request received on path: ${trimPath}
    Request Method: ${reqMethod}
    Query received: ${queryStringObj}
    Headers: ${reqHeader}
    Payload: ${buffer}
    `);
    console.log(JSON.parse(queryStringObj));
  });

  // get HTTP request method
  let reqMethod = req.method.toUpperCase();
});

// Start the server and listening to port 3000
server.listen(3000, () => console.log("Listening on port 3000"));
