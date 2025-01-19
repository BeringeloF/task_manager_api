/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema
    .withSchema('main_schema')
    .createTable('roles', function (table) {
      table.increments('role_id');
      table.string('name', 100).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function (knex) {
  return knex.schema.withSchema('main_schema').dropTable('roles');
};
