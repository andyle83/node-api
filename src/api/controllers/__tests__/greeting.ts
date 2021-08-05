import request from 'supertest';
import {Express} from 'express-serve-static-core';

import {createServer} from '@exmpl/utils/server';

let server: Express;

beforeAll(async () => {
  server = await createServer()
});

describe('GET /hello', () => {
  it('should return 200 & valid response if request param list is empty', function(done) {
    request(server).get(`/api/v1/hello`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'message': 'Hello, stranger!'})
        done()
      });
  });

  it('should return 200 & valid response if name param is set', function(done) {
    request(server)
      .get(`/api/v1/hello?name=Test%20Name`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'message': 'Hello, Test Name!'})
        done()
      });
  });
  
  it('should return 400 & valid error response if name param is empty', function(done) {
    request(server)
      .get(`/api/v1/hello?name=`)
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err)
        expect(res.body).toMatchObject({'error': {
          type: 'request_validation', 
          message: expect.stringMatching(/Empty.*\'name\'/), 
          errors: expect.anything()
        }})
        done()
      });
  });
});