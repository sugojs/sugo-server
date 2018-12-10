# **@sugo/server**

Http server abstraction that includes the minimal dependencies for a express-like API. It uses the native NodeJS http server along with a few components of the [pillarjs](https://pillarjs.github.io/) project handled by the ExpressJS team, whick seeks to extract key components from express.

The server implementes:

- Request body extraction
- Request Logging
- Response Logging
- Routing
- Server error handling (Route error handler must be implemented by the user)

All this is implemented on a Server class that can be subclassed in order to extend it

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
 * Error Handler
 */
server.router.use(require("./exceptions/handler"));

module.exports = server;
```
