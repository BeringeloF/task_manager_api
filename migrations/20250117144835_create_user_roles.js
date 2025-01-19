/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema
    .withSchema('main_schema')
    .createTable('user_roles', function (table) {
      table.integer('role_id').notNullable();
      table
        .foreign('role_id')
        .references('role_id')
        .inTable('main_schema.roles')
        .onDelete('CASCADE');
      table.integer('user_id').notNullable();
      table
        .foreign('user_id')
        .references('user_id')
        .inTable('main_schema.users')
        .onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.primary(['role_id', 'user_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function (knex) {
  return knex.schema.withSchema('main_schema').dropTable('user_roles');
};
