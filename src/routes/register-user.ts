import type { FastifyInstance } from "fastify";
import { z } from "zod";
import { hash } from "argon2";
import { randomUUID } from "node:crypto";
import { database } from "../database";

export async function userRoutes(app: FastifyInstance) {
  (app.post("/register", async (req, reply) => {
    const UserSchema = z.object({
      username: z.string(),
      password: z.string(),
    });

    const { username, password } = UserSchema.parse(req.body);
    const passwordHashed = await hash(password);

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/meals",
        maxAge: 60 * 60 * 24 * 5, // 5 days
      });
    }

    await database("users").insert({
      id: randomUUID(),
      username,
      password: passwordHashed,
      session_id: sessionId,
    });

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie("sessionId", sessionId, {
        path: "/meals",
        maxAge: 60 * 60 * 24 * 5, // 5 days
      });
    }

    return reply.status(201).send();
  }),
    app.get("/users", async (req, reply) => {
      const users = await database("users").select();

      return reply.send({ users: users });
    }));
}
