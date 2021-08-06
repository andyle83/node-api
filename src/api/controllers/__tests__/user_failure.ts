import request from 'supertest'
import {Express} from 'express-serve-static-core'

import UserService from '@exmpl/api/services/user'
import {createServer} from '@exmpl/utils/server'
import { rejects } from 'assert'

jest.mock('@exmpl/api/services/user')
jest.setTimeout(10000);

let server: Express
beforeAll(async () => {
  server = await createServer()
})

describe('auth failure', () => {
  it('should return 500 & valid response if auth rejects with an error', function(done) {
    (UserService.auth as jest.Mock).mockImplementation(() => Promise.reject("error"))
    request(server)
      .get(`/api/v1/goodbye`)
      .set('Authorization', 'Bearer fakeToken')
      .expect(500)
      .end(function(err, res) {
        if (err) return done(err)
        expect(res.body).toMatchObject({error: {type: 'internal_server_error', message: 'Internal Server Error'}})
        done()
      })
  })
})