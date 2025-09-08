import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { server } from "../app";
import request from 'supertest'

describe('Meals Routes', () => {
  beforeAll(async () => {
    await server.ready()
  })

  afterAll(async () => {
    await server.close()
  })

  it('should be abble to create a meal', async () => {
    const responseUserRoute = await request(server.server)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({
        username: 'test123',
        password: '1234'
      })

    const cookies = responseUserRoute.get('Set-Cookie')

    const createUserMeal = await request(server.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        "meal": {
            "name": "Dieta sobre salada 4 ",
            "description": "Fazer essa dieta 4 ",
            "some_date": "2025-08-07",
            "some_time": "20:20",
            "in_diet": false
          }
      })

    expect(createUserMeal.status).toEqual(201)
  })

  it('should be abble to list all users meals', async () => {
    const responseUserRoute = await request(server.server)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({
        username: 'test123',
        password: '1234'
      })

    const cookies = responseUserRoute.get('Set-Cookie')

    await request(server.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        "meal": {
            name: "Dieta sobre salada 4 ",
            description: "Fazer essa dieta 4 ",
            some_date: "2025-08-07",
            some_time: "20:20",
            in_diet: false
          }
      })

    const listAllUserMeals = await request(server.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    expect(listAllUserMeals.body.meals).toEqual([
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        some_date: expect.any(String),
        some_time: expect.any(String),
        in_diet: expect.any(Number) // return 0 or 1
      })
    ])
  })

  it('should be abble to list a specific user meal', async () => {
    const responseCreateUser = await request(server.server)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({
        username: 'teste123',
        password: '12345'
      })
      .expect(201)

    const cookies = responseCreateUser.get('Set-Cookie')

    await request(server.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        "meal": {
            name: "Dieta sobre salada 4 ",
            description: "Fazer essa dieta 4 ",
            some_date: "2025-08-07",
            some_time: "20:20",
            in_diet: false
          }
      })

    const listAllMeals = await request(server.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    const listUserMeals = listAllMeals.body.meals[0].id

    const listUserSpecificMeal = await request(server.server)
      .get(`/meals/${listUserMeals}`)
      .set('Cookie', cookies!)
      .expect(200)

    expect(listUserSpecificMeal.body.meals).toEqual(
      expect.objectContaining({
        name: expect.any(String),
        description: expect.any(String),
        some_date: expect.any(String),
        some_time: expect.any(String),
        in_diet: expect.any(Number)
      })
    )
  })

  it('should be abble to list all user metrics', async () => {
    const responseCreateUser = await request(server.server)
      .post('/register')
      .set('Content-type', 'application/json')
      .send({
        username: 'teste123',
        password: '12345'
      })
      .expect(201)

    const cookies = responseCreateUser.get('Set-Cookie')

    await request(server.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        "meal": {
            name: "Dieta sobre salada 4 ",
            description: "Fazer essa dieta 4 ",
            some_date: "2025-08-07",
            some_time: "20:20",
            in_diet: false
          }
      })

    await request(server.server)
      .post('/meals')
      .set('Cookie', cookies!)
      .send({
        "meal": {
            name: "Dieta sobre salada 4 ",
            description: "Fazer essa dieta 4 ",
            some_date: "2025-08-07",
            some_time: "20:20",
            in_diet: true
          }
      })

    await request(server.server)
      .get('/meals')
      .set('Cookie', cookies!)
      .expect(200)

    const userMetrics = await request(server.server)
      .get('/meals/metrics')
      .set('Cookie', cookies!)
      .expect(200)

    expect(userMetrics.body.metrics).toEqual(
      expect.objectContaining({
        totalMeals: expect.any(Number),
        totalMealsInDiet: expect.any(Number),
        totalMealsOutDiet: expect.any(Number),
        bestMealSequence: expect.any(Number)
      })
    )
  })

})
