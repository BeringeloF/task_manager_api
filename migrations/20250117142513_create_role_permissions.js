/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema
    .withSchema('main_schema')
    .createTable('role_permissions', function (table) {
      table.integer('role_id').notNullable();
      table
        .foreign('role_id')
        .references('role_id')
        .inTable('main_schema.roles')
        .onDelete('CASCADE');
      table.integer('permission_id').notNullable();
      table
        .foreign('permission_id')
        .references('permission_id')
        .inTable('main_schema.permissions')
        .onDelete('CASCADE');
      table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
      table.primary(['role_id', 'permission_id']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function (knex) {
  return knex.schema.withSchema('main_schema').dropTable('role_permissions');
};
