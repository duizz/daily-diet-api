import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { database } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { randomUUID } from "node:crypto";

export async function mealsRoutes(app: FastifyInstance) {
  app.post(
    "/meals",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const MealSchema = z.object({
        meal: z.object({
          name: z.string(),
          description: z.string(),
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
        some_date: new Date().getDate().toLocaleString("PT-BR"),
        some_time: new Date().getHours(),
        in_diet: meal.in_diet,
      });

      return reply.status(201).send();
    },
  );

  app.get(
    "/meals",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, reply) => {
      const sessionId = req.cookies.sessionId;

      const user = await database("users")
        .where("session_id", sessionId)
        .first();

      if (!user.id) {
        return reply.status(400).send({ message: "Invalid credentials." });
      }

      const meals = await database("meals").where("user_id", user.id);

      return reply.status(200).send({ meals: meals });
    },
  );

  app.get(
    "/meals/:id",
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
      const user = await database("users")
        .where("id", id)
        .andWhere("session_id", sessionId)
        .first();

      if (!user.id) {
        return reply.status(400).send({ message: "Invalid credentials." });
      }

      try {
        const meals = await database("meals").where("user_id", user.id).first();

        if (user.id === meals.user_id) {
          return reply.status(200).send({ meals: meals });
        }
      } catch (error) {
        return reply.status(401).send({ error: "Unaunthorized " });
      }
    },
  );

  app.put(
    "/meals/:id",
    { preHandler: [checkSessionIdExists] },
    async (req, reply) => {
      const paramsSchema = z.object({
        id: z.string(),
      });

      const mealSchema = z.object({
        name: z.string(),
        description: z.string(),
        some_date: z.number(),
        some_time: z.number(),
        in_diet: z.boolean(),
      });

      const { id } = paramsSchema.parse(req.params);
      const { name, description, some_date, some_time, in_diet } =
        mealSchema.parse(req.body);

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
    "/meals/:id",
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
}
