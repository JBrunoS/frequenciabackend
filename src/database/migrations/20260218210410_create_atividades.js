/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("atividades", function (table) {
    table.increments("id").primary();

    table.integer("id_projeto").unsigned().notNullable();

    table.string("nome").notNullable();
    table.text("descricao").notNullable();

    table.string("area").notNullable();

    table.decimal("custo", 10, 2).defaultTo(0);

    table.integer("mes_realizacao").notNullable(); // 1 a 12
    table.integer("ano_realizacao").notNullable();

    table
      .enu("status", ["pendente", "em_andamento", "concluida", "cancelada"])
      .defaultTo("pendente");

    table.timestamps(true, true);

    table
      .foreign("id_projeto")
      .references("id")
      .inTable("projetos")
      .onDelete("CASCADE"); // opcional mas recomendado
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("atividades");
};
