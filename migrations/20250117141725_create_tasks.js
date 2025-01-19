/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema
    .withSchema('main_schema')
    .createTable('tasks', function (table) {
      table.increments('task_id');
      table.string('title', 100).notNullable();
      table.string('description', 2500).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.integer('created_by').unsigned().notNullable();
      table
        .foreign('created_by')
        .references('user_id')
        .inTable('main_schema.users')
        .onDelete('CASCADE');
      table.timestamp('completed_at');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function (knex) {
  return knex.schema.withSchema('main_schema').dropTable('tasks');
};
