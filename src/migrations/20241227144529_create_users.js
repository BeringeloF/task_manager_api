/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export const up = function (knex) {
  return knex.schema.createTable('users', function (table) {
    table.increments('user_id');
    table.string('name', 100).notNullable();
    table.string('email', 320).unique().notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
    table.string('password', 100).notNullable();
    table
      .enu('role', ['tecnico', 'gerente'], {
        useNative: true,
        existingType: true,
        enumName: 'role_type',
      })
      .defaultTo('tecnico')
      .notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */

export const down = function (knex) {
  return knex.schema.dropTable('users');
};
