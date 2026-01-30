/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('solicitacao_timeline', function (table) {
    table.increments('id').primary();

    table
      .integer('solicitacao_id')
      .notNullable()
      .unsigned()
      .references('id')
      .inTable('solicitacoes')
      .onDelete('CASCADE');

    table.string('etapa').notNullable();
    table.string('acao').notNullable();

    table.text('descricao');

    table.integer('usuario_id');
    table.string('usuario_nome');
    table.string('usuario_role');

    table.timestamp('data_hora').defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('solicitacao_timeline');
};
