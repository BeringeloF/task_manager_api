/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema
    .withSchema('main_schema')
    .createTable('permissions', function (table) {
      table.increments('permission_id');
      table.string('context', 100).notNullable();
      table.string('action', 100).notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function (knex) {
  return knex.schema.withSchema('main_schema').dropTable('permissions');
};
