import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("meals", (table) => {
    table.uuid("id").primary();
    table.uuid("user_id").references("id").inTable("users").index(),
    table.text("name"),
    table.text("description"),
    table.date("some_date").defaultTo(knex.raw("(date('now'))")),
    table
      .specificType("some_time", "time")
      .defaultTo(knex.raw("(time('now'))")),
    table.boolean("in_diet");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("meals");
}
