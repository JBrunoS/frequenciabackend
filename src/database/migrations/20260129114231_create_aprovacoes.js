/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('aprovacoes', function (table) {
    table.increments('id').primary();

    table
      .integer('solicitacao_id')
      .notNullable()
      .unsigned()
      .references('id')
      .inTable('solicitacoes')
      .onDelete('CASCADE');

    table.string('etapa').notNullable(); 
    table.string('role').notNullable();  

    table.string('status').notNullable();

    table.text('observacao');

    table.integer('aprovado_por_id');
    table.string('aprovado_por_nome');

    table.timestamp('data_decisao');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('aprovacoes');
};
