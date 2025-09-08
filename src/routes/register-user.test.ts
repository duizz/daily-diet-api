import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import request from 'supertest'
import { server } from '../app'
import { execSync } from 'node:child_process'

describe('Create User Route', () => {


  beforeAll(async () => {
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  beforeEach(() => {
    execSync('npm run knex -- migrate:rollback --all')
    execSync('npm run knex -- migrate:latest')
  })

  test('should be abble to create a user ', async () => {

   await request(server.server)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({
        username: "teste123",
        password: "teste1234"
      })
      .expect(201)
  })
})
