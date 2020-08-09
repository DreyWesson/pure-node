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
  let trimmedPath = path.replace(/^\/+|\/+$/g, "");

  // Get query string as an object
  let queryStringObj = parsedUrl.query;
  queryStringObj = JSON.stringify(queryStringObj);

  // Get the Headers as an object
  let reqHeader = JSON.stringify(req.headers, null, 5);

  // get HTTP request method
  let reqMethod = req.method.toUpperCase();

  // Get Payload, if any
  const decoder = new StringDecoder("utf-8");
  let buffer = "";
  req.on("data", (data) => {
    buffer += decoder.write(data);
  });
  req.on("end", () => {
    buffer += decoder.end();

    // Choose handler for each request, if not found render 404
    let chooseHandler =
      typeof router[trimmedPath] !== "undefined"
        ? router[trimmedPath]
        : handlers.notfound;

    // Construct d data object to send to handler
    let data = {
      trimmedPath,
      queryStringObj,
      reqMethod,
      reqHeader,
      payloads: buffer,
    };

    // Route request to the chosen handler specified in the router
    chooseHandler(data, (statusCode, payload) => {
      // Use the status code called back by the handler or default to 200
      statusCode = typeof statusCode == "number" ? statusCode : 200;

      // Use the payload called back by the handler or default to 200
      payload = typeof payload == "object" ? payload : {};

      // convert payload to string
      let payloadStringify = JSON.stringify(payload);

      // Return response
      res.writeHead(statusCode);
      res.end(payloadStringify);

      // Log request path
      console.log("Return this response: ", statusCode, payloadStringify);
    });
  });
});

// Start the server and listening to port 3000
server.listen(3000, () => console.log("Listening on port 3000"));

// Define handlers
let handlers = {};

// Define sample handler
handlers.sample = (data, callback) => {
  // Callback HTTP status code and the payload object
  callback(406, { name: "sample handler" });
};
handlers.foo = (data, callback) => {
  // Callback HTTP status code and the payload object
  callback(406, { foo: "baz handler" });
};
handlers.fizz = (data, callback) => {
  // Callback HTTP status code and the payload object
  callback(406, { fizz: "buzz handler" });
};

// Not found handler
handlers.notfound = (data, callback) => {
  callback(404);
};

// Define request router
let router = {
  sample: handlers.sample,
  foo: handlers.foo,
  fizz: handlers.fizz,
};
