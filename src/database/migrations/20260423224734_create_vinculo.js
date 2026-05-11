/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("professor_projetos", function (table) {
    table.increments("id").primary().index();
    table.integer("id_professor").unsigned().notNullable();
    table.integer("id_projeto").unsigned().notNullable();
    table.string("funcao");
    table.boolean("status").defaultTo(1);
    table.timestamps(true, true);

    table.foreign("id_professor").references("id").inTable("professor");
    table.foreign("id_projeto").references("id").inTable("projetos");

    // impede vínculo duplicado
    table.unique(["id_professor", "id_projeto"]);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("professor_projetos");
};