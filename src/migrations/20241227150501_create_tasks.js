/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('tasks', function (table) {
    table.increments('task_id');
    table.string('title', 100).notNullable();
    table.string('description', 2500).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.timestamp('completed_at');
    table.integer('assigned_to').notNullable();
    table.foreign('assigned_to').references('users.user_id');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function (knex) {
  return knex.schema.dropTable('tasks');
};
