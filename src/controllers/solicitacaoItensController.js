const connection = require("../database/connection");

module.exports = {
  async create(req, res) {
    const { id } = req.params; // solicitacao_id
    const { itens } = req.body;

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return res.status(400).json({
        error: "Itens são obrigatórios",
      });
    }

    const itensFormatados = itens.map((item) => ({
      solicitacao_id: id,
      id_projeto: item.id_projeto,
      descricao: item.descricao,
      valor_unitario: item.valor_unitario,
      quantidade: item.quantidade,
      valor_total: item.valor_unitario * item.quantidade,
    }));

    await connection("solicitacao_itens").insert(itensFormatados);

    return res.status(201).json({
      message: "Itens adicionados com sucesso",
    });
  },

  async index(req, res) {
    const { id } = req.params;

    const itens = await connection("solicitacao_itens")
      .where("solicitacao_id", id)
      .select("*");

    return res.json(itens);
  },
};
