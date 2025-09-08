import fastify from "fastify";
import { userRoutes } from "./routes/register-user";
import cookies from "@fastify/cookie";
import { mealsRoutes } from "./routes/meals";
import { env } from './env/index'

export const server = fastify();

server.register(cookies);
server.register(userRoutes);
server.register(mealsRoutes, {
  prefix: "/meals"
});
