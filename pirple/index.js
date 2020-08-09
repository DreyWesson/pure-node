const http = require("http");
const https = require("https");
const url = require("url");
const StringDecoder = require("string_decoder").StringDecoder;
var config = require("./config");
const fs = require("fs");
console.log(config);

// Instantiate the HTTP server
let httpServer = http.createServer((req, res) => {
  unifiedServer(req, res);
});
// Start the server and listening to port 3000
httpServer.listen(config.httpPort, () =>
  console.log("Listening on port: " + config.httpPort)
);

// Instantiate the HTTPS server
let httpsServerOptions = {
  key: fs.readFileSync("./https/key.pem"),
  cert: fs.readFileSync("./https/certificate.pem"),
};
let httpsServer = http.createServer(httpsServerOptions, (req, res) => {
  unifiedServer(req, res);
});
// Start the server and listening to port 3000
httpsServer.listen(config.httpsPort, () =>
  console.log("Listening on port: " + config.httpsPort)
);

// All server logic for both http and https server
var unifiedServer = (req, res) => {
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
};

// Define handlers
let handlers = {};

// Define sample handler
handlers.sample = (data, callback) => {
  // Callback HTTP status code and the payload object
  callback(406, { name: "sample handler" });
};

// Not found handler
handlers.notfound = (data, callback) => {
  callback(404);
};

// Define request router
let router = {
  sample: handlers.sample,
};
