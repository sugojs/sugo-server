# **@sugo/server**

Http server abstraction that includes the minimal dependencies for a express-like API. It extends the vanilla NodeJS Http Server, Http Request and Http Response.

Router agnostic. It is recommended to use with [@sugo/router](https://www.npmjs.com/package/@sugo/router).

The server implements:

- Request body extraction
- Server middleware
- URL parsing
- Express-style Response Helper methods (status, json)
- Error Handling

All this is implemented on a Server class that can be subclassed in order to extend it

# **SuGoServer**

## **Options**

- **@param {\*} requestHandler:** The NodeJS request handler

# **SuGoSecureServer**

## **Options**

- **@param {\*} requestHandler:** The NodeJS request handler
- **@param {\*} options:** The NodeJS https options

## **Requirements**

node version >= 9.11.2

## **How to install**

```shell
npm install --save @sugo/server
```

## **Creating a Http Server**

A server can be created using the new Server() constructor, but it is recommended to use the createServer method unless you have the need to use new Server().

```typescript
import { createServer, SuGoRequest, SuGoResponse, INextFunction } from '@sugo/server';
const server = createServer((req: SuGoRequest, res: SuGoResponse) =>
  res.status(200).json({ first: req.first, second: req.second }),
);
```

## **Creating a Https Server**

A server can be created using the new Server() constructor, but it is recommended to use the createServer method unless you have the need to use new Server().

```typescript
import { createServer, SuGoRequest, SuGoResponse, INextFunction } from '@sugo/server';
const server = createSecureServer(
  (req: SuGoRequest, res: SuGoResponse) => res.status(200).json({ first: req.first, second: req.second }),
  {
    cert: fs.readFileSync(path.resolve(__dirname, 'server.cert')),
    key: fs.readFileSync(path.resolve(__dirname, 'server.key')),
  },
);
```

## **Middleware**

Middleware can be added for the whole server using the useMiddleware method. The middleware stack will start before the request handler, but the sequence be defined by the use of the next() function. This function calls the next function in the stack. **Next is an async function**.

```typescript
import { createServer, SuGoRequest, SuGoResponse, INextFunction } from '@sugo/server';

const server = createServer((req: SuGoRequest, res: SuGoResponse) =>
  res.status(200).json({ first: req.first, second: req.second }),
);
server.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => {
  req.foo = 'fighters';
  if (next) {
    await next();
  }
});
```

## **Error handling**

The server uses the following default handler:

```typescript
class SuGoServer extends Server {
  public defaultErrorHandler(req: SuGoRequest, res: SuGoResponse, err: IError) {
    /* If the error object has a handle method we use it */
    if (typeof err.handle === 'function') {
      err.handle(req, res);
    } else {
      const json = {
        code: err.code || 'N/A',
        message: err.message || 'Unexpected Error',
        name: err.name || err.constructor.name,
        stack: '',
        status: err.status || 500,
      };
      if (err.stack) {
        json.stack = err.stack;
      }
      res.status(json.status).json(json);
    }
  }
}
```

The idea behind this handler is to give custom exceptions the power to define how should they be handled. This can be useful if the exception has custom data. If this error handler does not fufill your needs, it can be replaced with the server.setErrorHandler method that receives a function with the same signature.

## **Request body extraction**

To keep the modularity of the sugo modules and give our users more freedom, the body extraction must be handled with middleware. SuGoJS has the following middleware available:

- [json](https://github.com/franciscosucre/sugo-body-parser-json)
- [form-data, multipart and www-form-urlencoded](https://github.com/franciscosucre/sugo-body-parser-form-data-multipart)

## **Logging**

To keep the modularity of the sugo modules (and because each project has different logging needs), the request logging must be made through user middleware. We leave an example of such middleware for common cases.

```typescript
import { SuGoRequest, SuGoResponse } from '@sugo/server';
import * as util from 'util';

const logRequest = async (req: SuGoRequest, res: SuGoResponse, next?: () => any) => {
  let log: string = util.format('Request ID: ( %s ) %s: %s', req.id, req.method, req.url);
  log += util.format(' --> query %j', req.query);
  log += util.format(' --> body %j', req.body);
  logger.info(log);
  return next ? await next() : null;
};

const logResponse = async (req: SuGoRequest, res: SuGoResponse, next?: () => any) => {
  next ? await next() : null;
  const now = new Date().toISOString();
  const { id, statusCode, statusMessage, body, method, url } = res;
  const log = `${now}: Response ID: ( ${id} ) ${method}: ${url} ${statusCode} ${statusMessage} ---> body: ${JSON.stringify(
    body,
  )}`;
  if (statusCode >= 400) {
    logger.error(log);
  } else {
    logger.info(log);
  }
  return;
};

const server = createServer(HANDLER)
  .useMiddleware(logRequest)
  .useMiddleware(logResponse);
```

## **Helper methods**

- res.json(data): Sets the response type to JSON and sends an JSON object.
- res.status(status): Sets the status for the response

```typescript
import { createServer, SuGoRequest, SuGoResponse } from '@sugo/server';
const server = createServer(
  (req: SuGoRequest, res: SuGoResponse) => res.status(200).json({ first: req.first, second: req.second }),
  customLogger,
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

```typescript
import { createServer, SuGoRequest, SuGoResponse } from '@sugo/server';
import { Router } from '@sugo/router';
import * as cors from 'cors';

const router = new Router();
router.get('/foo', (req: SuGoRequest, res: SuGoResponse) => res.end(JSON.stringify({ foo: req.foo })));

// createServer is
const server = createServer(async (req: SuGoRequest, res: SuGoResponse) => await router.handle(req, res));

server.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS');
  res.setHeader('Access-Control-Max-Age', 2592000);
  if (next) {
    await next();
  }
});
```
