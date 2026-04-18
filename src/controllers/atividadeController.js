const knex = require("../database/connection");
 
module.exports = {
  //Criar atividade
  async create(req, res) {
    try {
      const { id_projeto } = req.params;
 
      const {
        nome,
        descricao,
        area,
        custo,
        mes_realizacao,
        ano_realizacao,
        status,
      } = req.body;
 
      if (!id_projeto) {
        return res.status(400).json({ error: "Projeto não informado" });
      }
 
      if (!nome || !descricao || !area || !mes_realizacao || !ano_realizacao) {
        return res
          .status(400)
          .json({ error: "Campos obrigatórios não preenchidos" });
      }
 
      const mes = parseInt(mes_realizacao);
      const ano = parseInt(ano_realizacao);
      const valor = Number(custo || 0);
 
      if (isNaN(mes) || mes < 1 || mes > 12) {
        return res.status(400).json({ error: "Mês inválido" });
      }
 
      const [id] = await knex("atividades").insert({
        id_projeto,
        nome,
        descricao,
        area,
        custo: valor,
        mes_realizacao: mes,
        ano_realizacao: ano,
        status: status || "pendente",
      });
 
      return res.status(201).json({ id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Erro ao cadastrar atividade" });
    }
  },
 
  //Listar atividades
  async index(req, res) {
    try {
      const { id_projeto, ano } = req.params;
 
      if (!id_projeto) {
        return res.status(400).json({ error: "Projeto não informado" });
      }
 
      const atividades = await knex("atividades")
        .where({ id_projeto, ano_realizacao: ano })
        .orderBy("created_at", "desc");
 
      return res.json(atividades);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar atividades" });
    }
  },
 
  // &#128313; Buscar atividade específica
  async show(req, res) {
    try {
      const { id, id_projeto } = req.params;
 
      if (!id_projeto) {
        return res.status(400).json({ error: "Projeto não informado" });
      }
 
      const atividade = await knex("atividades")
        .where({ id, id_projeto })
        .first();
 
      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }
 
      return res.json(atividade);
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Erro ao buscar atividade" });
    }
  },
 
  //Atualizar status
  async updateStatus(req, res) {
    try {
      const { id, id_projeto } = req.params;
      const { status } = req.body;
 
      const statusPermitidos = [
        "pendente",
        "em_andamento",
        "concluida",
        "cancelada",
      ];
 
      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }
 
      const atividade = await knex("atividades")
        .where({ id, id_projeto })
        .first();
 
      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }
 
      await knex("atividades").where({ id, id_projeto }).update({ status });
 
      return res.json({ message: "Status atualizado com sucesso" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Erro ao atualizar status" });
    }
  },
 
  async update(req, res) {
    try {
      const { id, id_projeto } = req.params;
 
      const {
        nome,
        descricao,
        area,
        custo,
        mes_realizacao,
        ano_realizacao,
        status,
      } = req.body;
 
      const statusPermitidos = [
        "pendente",
        "em_andamento",
        "concluida",
        "cancelada",
      ];
 
      if (!statusPermitidos.includes(status)) {
        return res.status(400).json({ error: "Status inválido" });
      }
 
      const atividade = await knex("atividades")
        .where({ id, id_projeto })
        .first();
 
      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }
 
      const mes = parseInt(mes_realizacao);
      const ano = parseInt(ano_realizacao);
      const valor = Number(custo || 0);
 
      await knex("atividades").where({ id, id_projeto }).update({
        nome,
        descricao,
        area,
        custo: valor,
        mes_realizacao: mes,
        ano_realizacao: ano,
        updated_at: knex.fn.now(),
        status
      });
 
      return res.json({ message: "Atividade atualizada com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar atividade" });
    }
  },
 
  // &#128313; Deletar
  async delete(req, res) {
    try {
      const { id, id_projeto } = req.params;
 
      const atividade = await knex("atividades")
        .where({ id, id_projeto })
        .first();
 
      if (!atividade) {
        return res.status(404).json({ error: "Atividade não encontrada" });
      }
 
      await knex("atividades").where({ id, id_projeto }).delete();
 
      return res.json({ message: "Atividade removida" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ error: "Erro ao deletar atividade" });
    }
  },
 
// Listar atividades pendentes e em andamento
async listarPendentes(req, res) {
  try {
    const { id_projeto } = req.params;
 
    const atividades = await knex("atividades")
      .where({ id_projeto })
      .whereIn("status", ["pendente", "em_andamento"])
      .orderBy("mes_realizacao", "asc");
 
    return res.json(atividades);
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: "Erro ao buscar atividades pendentes",
    });
  }
},
};