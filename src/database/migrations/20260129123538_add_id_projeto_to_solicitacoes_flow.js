/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    // solicitacoes
    .alterTable('solicitacoes', function (table) {
      table.integer('id_projeto').notNullable().after('id');
    })

    // aprovacoes
    .alterTable('aprovacoes', function (table) {
      table.integer('id_projeto').notNullable().after('id');
    })

    // timeline
    .alterTable('solicitacao_timeline', function (table) {
      table.integer('id_projeto').notNullable().after('id');
    })

    // itens
    .alterTable('solicitacao_itens', function (table) {
      table.integer('id_projeto').notNullable().after('id');
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('solicitacao_itens', function (table) {
      table.dropColumn('id_projeto');
    })
    .alterTable('solicitacao_timeline', function (table) {
      table.dropColumn('id_projeto');
    })
    .alterTable('aprovacoes', function (table) {
      table.dropColumn('id_projeto');
    })
    .alterTable('solicitacoes', function (table) {
      table.dropColumn('id_projeto');
    });
};
