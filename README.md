# **@sugo/server**

Http server abstraction that includes the minimal dependencies for a express-like API. It uses the native NodeJS http server along with a few components of the [pillarjs](https://pillarjs.github.io/) project handled by the ExpressJS team, whick seeks to extract key components from express.

The server implements:

- Request body extraction
- Request Logging
- Response Logging

All this is implemented on a Server class that can be subclassed in order to extend it

# **SuGoServer**

router = new Router(), logger = console, options = {}

## **Options**

- **@param {Router} router:** PillarJS router
- **@param {\*} logger:** Any object with the usual logging methods (log, debug, info, error)
- **@param {\*} [options={}]**
- **@param {\*} [options.IncomingMessage=SuGoRequest]:** NodeJS Http incoming message subclass
- **@param {\*} [options.ServerResponse=SuGoResponse]:** NodeJS Http Server response subclass

## **How to install**

```shell
npm install --save @sugo/server
```

## **Example**

```javascript
const { Server } = require("@sugo/server");

const server = new Server();

/**
 * MIDDLEWARE
 */
server.router
  .use(require("helmet")())
  .use(require("cors")())
  .use(require("compression")());

/**
 * ROUTES
 */
server.router.use("/", require("./routes"));

/**
 * Error Handler (MUST BE ADDED AFTER ROUTES)
 */
server.useDefaultErrorHandler();

module.exports = server;
```
