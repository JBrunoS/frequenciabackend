/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('solicitacao_itens', function (table) {
    table.increments('id').primary();

    table
      .integer('solicitacao_id')
      .notNullable()
      .unsigned()
      .references('id')
      .inTable('solicitacoes')
      .onDelete('CASCADE');

    table.string('descricao').notNullable();

    table.decimal('valor_unitario', 12, 2).notNullable();
    table.integer('quantidade').notNullable();

    table.decimal('valor_total', 12, 2).notNullable();

    table.timestamp('criado_em').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('solicitacao_itens');
};
