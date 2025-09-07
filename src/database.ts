import { knex, type Knex } from "knex";
import { env } from "./env";

export const config: Knex.Config = {
  client: "sqlite",
  connection: {
    filename: env.NODE_ENV,
  },
  useNullAsDefault: true,
  migrations: {
    extension: "ts",
    directory: "./db/migrations/",
  },
};

export const database = knex(config);
