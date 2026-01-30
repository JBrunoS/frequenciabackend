/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable('solicitacoes', function (table) {
    table.increments('id').primary();

    table.string('titulo').notNullable();
    table.text('descricao');

    table.integer('atividade_id').notNullable();

    table.decimal('valor_total', 12, 2).notNullable();
    table.string('local_compra');

    table.timestamp('data_criacao').defaultTo(knex.fn.now());
    table.date('data_prazo');

    table.string('status').notNullable();
    table.string('etapa_atual').notNullable();

    table.integer('criado_por_id').notNullable();
    table.string('criado_por_role').notNullable();

    table.timestamp('atualizado_em');
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable('solicitacoes');
};
