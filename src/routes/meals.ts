import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { database } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { randomUUID } from "node:crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const MealSchema = z.object({
        meal: z.object({
          name: z.string(),
          description: z.string(),
          some_date: z.iso.date(),
          some_time: z.iso.time(),
          in_diet: z.boolean(),
        }),
      });

      const user = await database("users")
        .select()
        .where("session_id", req.cookies.sessionId)
        .first();

      if (!user.id) {
        return reply.status(400).send({ message: "Invalid credentials." });
      }

      const { meal } = MealSchema.parse(req.body);

      await database("meals").insert({
        id: randomUUID(),
        user_id: user.id,
        name: meal.name,
        description: meal.description,
        some_date: meal.some_date,
        some_time: meal.some_time,
        in_diet: meal.in_diet,
      });

      return reply.status(201).send();
    },
  );

  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const sessionId = req.cookies.sessionId;

      try {
        const user = await database("users")
          .where("session_id", sessionId)
          .first();

        if (!user.id) {
          return reply.status(400).send({ message: "Invalid credentials." });
        }

        const meals = await database("meals").where("user_id", user.id);

        if(meals.length <= 0 ) {
          return reply.status(400).send({ message: 'User meal not found.'});
        }

        return reply.send({ meals: meals });
      } catch (error) {
        return reply.status(500).send({ error: error  });
      }
    },
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const paramsSchema = z.object({
        id: z.string(),
      });

      const { id } = paramsSchema.parse(req.params);

      if (!id) {
        return reply.status(400).send({ message: "Daily Diet not found." });
      }

      const sessionId = req.cookies.sessionId;

      const userMeals = await database("users")
        .leftJoin("meals", "users.id", "meals.user_id")
        .where({ "users.session_id": sessionId, "meals.id": id})
        .select("meals.*")
        .first()

      if (!userMeals.user_id) {
        return reply.status(400).send({ message: "Invalid credentials." });
      }

      return reply.send({ meals: userMeals });

    }
  );

  app.put(
    "/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, reply) => {
      const paramsSchema = z.object({
        id: z.string(),
      });

      const mealSchema = z.object({
        name: z.string(),
        description: z.string(),
        some_date: z.iso.date(),
        some_time: z.iso.time(),
        in_diet: z.boolean(),
      });

      const { id } = paramsSchema.parse(req.params);
      const {
        name,
        description,
        some_date,
        some_time,
        in_diet
      } = mealSchema.parse(req.body);

      if (!id) {
        return reply.status(400).send({ message: "Daily Diet not found." });
      }

      await database("users")
        .where("session_id", req.cookies.sessionId)
        .first();

      try {
        await database("meals").where("id", id).update({
          name,
          description,
          some_date,
          some_time,
          in_diet,
        });

        return reply.status(203).send();
      } catch (error) {
        return reply.status(401).send({ error: "Unaunthorized" });
      }
    },
  );

  app.delete(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const paramsSchema = z.object({
        id: z.string(),
      });

      const { id } = paramsSchema.parse(req.params);

      if (!id) {
        return reply.status(400).send({ message: "Daily Diet not found." });
      }

      await database("users")
        .where("session_id", req.cookies.sessionId)
        .first();

      try {
        const userDailyDiet = await database("meals").where("id", id);

        await database("meals").where("id", id).delete(userDailyDiet);

        return reply.status(203).send();
      } catch (error) {
        return reply.status(401).send({ error: "Unaunthorized" });
      }
    },
  );

  app.get("/metrics", {
    preHandler: [ checkSessionIdExists],
  },
  async (req, reply) => {

    const sessionId = req.cookies.sessionId

    const user = await database("users").where("session_id", sessionId).first()

    const totalMeals = await database("meals").where("user_id", user.id).orderBy('some_date', "desc")
    const totalInDiet = await database("meals").where({ "user_id": user.id, "in_diet": true }).count('id', { as: 'total'}).first()
    const totalOutDiet = await database("meals").where({ "user_id": user.id, "in_diet": false }).count('id', { as: 'total'}).first()

    let bestMealSequence = 0;
    let currentSequence = 0;

    for (const meal of totalMeals){
      if(meal.in_diet === 1){
        currentSequence++
        if(currentSequence > bestMealSequence){
          bestMealSequence = currentSequence
        }
      } else{
        currentSequence = 0
      }
    }

    return reply.send({
      metrics: {
        totatMeals: totalMeals?.length,
        totalMealsInDiet: totalInDiet?.total,
        totalMealsOutDiet: totalOutDiet?.total,
        bestMealSequence: bestMealSequence
      }
    })

  })
}
