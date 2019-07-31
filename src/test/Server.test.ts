import * as chai from 'chai';
import * as supertest from 'supertest';

import { INextFunction } from '../behaviors/middleware';
import { createServer } from '../index';
import SuGoRequest from '../request';
import SuGoResponse from '../response';

const PATH = '/foo';
const headers = { 'Content-Type': 'application/json' };
const HANDLER = (req: SuGoRequest, res: SuGoResponse) => {
  res.writeHead(200, headers);
  res.end(
    JSON.stringify({
      req: {
        body: req.body,
        files: req.files,
        id: req.id,
        method: req.method,
        query: req.query,
        url: req.url,
      },
      res: { id: res.id, url: res.url, method: res.method },
    }),
  );
};
chai.should();

// Our parent block
describe('SuGo Server', () => {
  const server = createServer(HANDLER);
  describe(`Request`, () => {
    it('The request id should be set', async () => {
      const response = await supertest(server)
        .post(PATH)
        .send({ foo: 'fighters' });
      response.body.req.should.have.property('id');
    });

    it('The request url should be set', async () => {
      const response = await supertest(server).get(PATH);
      response.body.req.should.have.property('url');
    });
  });

  describe(`SuGoResponse`, () => {
    it('The response id should be equal to the request id', async () => {
      const response = await supertest(server)
        .post(PATH)
        .send({ foo: 'fighters' });
      response.body.res.should.have.property('id');
      response.body.res.id.should.be.eql(response.body.req.id);
    });

    it('The response path should be equal to the request url', async () => {
      const response = await supertest(server).get(PATH);
      response.body.res.should.have.property('url');
      response.body.res.url.should.be.eql(response.body.req.url);
    });

    it('The response method should be equal to the request method', async () => {
      const response = await supertest(server).get(PATH);
      response.body.res.should.have.property('method');
      response.body.res.method.should.be.eql(response.body.req.method);
    });

    it('should have the status code sent to the status() method', async () => {
      const status = 201;
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        res.status(status);
        res.json({});
      });
      const response = await supertest(newServer).get(PATH);
      response.status.should.be.eql(status);
    });

    it('should have the body sent to the json() method', async () => {
      const status = 201;
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        res.status(status);
        res.json({ foo: 'fighters' });
      });
      const response = await supertest(newServer).get(PATH);
      response.status.should.be.eql(status);
      response.body.should.have.property('foo');
      response.body.foo.should.be.eql('fighters');
    });
  });

  describe(`Middleware`, () => {
    it('should run the added middleware', async () => {
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) =>
        res.json({ first: req.first, second: req.second }),
      );
      newServer.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next: INextFunction) => {
        req.first = true;
        if (next) {
          await next();
        }
      });
      newServer.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next: INextFunction) => {
        req.second = true;
        if (next) {
          await next();
        }
      });
      const response = await supertest(newServer).get(PATH);
      response.body.should.have.property('first');
      response.body.first.should.be.eql(true);
      response.body.should.have.property('second');
      response.body.second.should.be.eql(true);
    });

    it('should handle the route and then continue the middleware', async () => {
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        req.handlerPassed = true;
        res.json({});
      });
      newServer.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => {
        req.handlerPassed = false;
        req.middlewarePassed = false;
        if (next) {
          await next();
        }
        req.handlerPassed.should.be.eql(true);
        req.middlewarePassed.should.be.eql(true);
      });
      newServer.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => {
        req.middlewarePassed = true;
        if (next) {
          await next();
        }
      });
      const response = await supertest(newServer).get(PATH);
      response.status.should.have.be.eql(200);
    });

    it('Should throw an error if an error is passed to the next method', async () => {
      const newServer = createServer((req: SuGoRequest, res: SuGoResponse) => {
        req.handlerPassed = true;
        res.json({});
      });
      newServer.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => {
        try {
          next ? await next(new Error('NewError')) : chai.assert.fail();
        } catch (error) {
          error.message.should.be.eql('NewError');
        }
      });
      newServer.useMiddleware(async (req: SuGoRequest, res: SuGoResponse, next?: INextFunction) => {
        if (next) {
          await next(new Error('NewError'));
        }
      });
    });
  });

  after(() => {
    process.exit(0);
  });
});
