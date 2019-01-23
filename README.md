# **@sugo/server**

Http server abstraction that includes the minimal dependencies for a express-like API. Router agnostic. It is recommended to use with [@sugo/router](https://www.npmjs.com/package/@sugo/router)

The server implements:

- Request body extraction
- Request Logging
- Response Logging
- Server middleware
- URL parsing
- Express-style Response Helper methods (status, json)
- Error Handling

All this is implemented on a Server class that can be subclassed in order to extend it

# **SuGoServer**

## **Options**

- **@param {\*} logger:** Any object with the usual logging methods (log, debug, info, error)
- **@param {\*} [httpServerOptions={}]**
- **@param {\*} [httpServerOptions.IncomingMessage=SuGoRequest]:** NodeJS Http incoming message subclass
- **@param {\*} [httpServerOptions.ServerResponse=SuGoResponse]:** NodeJS Http Server response subclass

## **How to install**

```shell
npm install --save @sugo/server
```

## **Router Middleware**

Middleware can be added for the whole server using the useMiddleware method. Any middleware added, will be executed before each request

```javascript
const server = new Server((req, res) =>
  res.status(200).json({ first: req.first, second: req.second })
);
server.useMiddleware((req, res) => (req.foo = "fighters"));
```

## **Error handling**

The server uses the following default handler:

```javascript
class SuGoServer extends Server {
  defaultErrorHandler(req, res, err) {
    /* If the error object has a handle method we use it */
    if (typeof err.handle === "function") {
      err.handle(req, res);
    } else {
      const json = {
        status: err.status || 500,
        name: err.name || err.constructor.name,
        code: err.code || "N/A",
        message: err.message || "Unexpected Error"
      };
      if (err.stack) {
        json.stack = err.stack;
      }
      res.status(json.status).json(json);
    }
  }
}
```

The idea behind this handler is to give custom exceptions the power to define how should they be handled. This can be useful if the exception has custom data. If this error handler does not fufill your needs, it can be replace with the server.setErrorHandler method.

## **Logging**

The server can receive any object with the common logger methods (log, info, error, warn, debug). It will use a console logger by default.

```javascript
const server = new Server(
  (req, res) => res.status(200).json({ first: req.first, second: req.second }),
  customLogger
);
```

The logger can be accesed via req.logger, res.logger or server.logger.

## **Helper methods**

- res.json(data): Sets the response type to JSON and sends an JSON object.
- res.status(status): Sets the status for the response

```javascript
const server = new Server(
  (req, res) => res.status(200).json({ first: req.first, second: req.second }),
  customLogger
);
```

## **Additional Properties - Request**

- id: Sets the response type to JSON and sends an JSON object.
- path: An url striped down of hashes and queryparams. Example: "/foo?hello=world" would result in path being "/foo"
- query: Parsed querystring stored as an object.
- body: Parsed request body stored as an object.

## **Additional Properties - Response**

For loggind purposes, we copy the id, path and method properties from the request.

## **Complete Application Example**

```javascript
const { Server } = require("@sugo/server");
const Router = require("@sugo/router");

const router = new Router();
router.get("/foo", (req, res) => res.end(JSON.stringify({ foo: req.foo })));

const server = new Server((req, res) =>
  res.json({ first: req.first, second: req.second })
);

const handleError = (req, res, err) => {
  const status = err.status || 500;
  res.writeHead(status, headers);
  res.end(
    JSON.stringify({
      code: err.code || err.name || "Error",
      message: err.message || "An unexpected error has ocurred",
      status
    })
  );
};

server.useMiddleware(cors());

try {
  if (!router.match(req.method, res.url))
    throw {
      name: "ResourceNotFound",
      message: "Resource not found",
      status: 404
    };
  await router.handle(req, res);
} catch (error) {
  handleError(req, res, error);
}
```
