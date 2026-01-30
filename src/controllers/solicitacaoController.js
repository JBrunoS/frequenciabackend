const connection = require("../database/connection");

module.exports = {
  async index(req, res) {
    const { id_projeto } = req.query;

    if (!id_projeto) {
      return res.status(400).json({ error: "id_projeto é obrigatório" });
    }

    const solicitacoes = await connection("solicitacoes")
      .where("id_projeto", id_projeto)
      .orderBy("data_criacao", "desc"); // ou data_criacao

    return res.json(solicitacoes);
  },

  async show(req, res) {
    const { id } = req.params;
    const id_projeto = req.headers.id_projeto;

    if (!id_projeto) {
      return res.status(400).json({
        error: "id_projeto não informado no header",
      });
    }

    const solicitacao = await connection("solicitacoes")
      .where({ id, id_projeto })
      .first();

    if (!solicitacao) {
      return res.status(404).json({
        error: "Solicitação não encontrada",
      });
    }

    const itens = await connection("solicitacao_itens").where(
      "solicitacao_id",
      id,
    );

    const timeline = await connection("solicitacao_timeline as t")
      .leftJoin("solicitacoes as s", "s.id", "=", "t.solicitacao_id")
      .leftJoin("aprovacoes as a", function () {
        this.on("a.solicitacao_id", "=", "t.solicitacao_id").andOn(
          "a.etapa",
          "=",
          "t.etapa",
        );
      })
      .where("t.solicitacao_id", id)
      .where("s.id_projeto", id_projeto) // Filtra aqui
      .select(
        "t.id",
        "t.etapa",
        "t.acao",
        "t.descricao",
        "t.usuario_id",
        "t.usuario_nome",
        "t.usuario_role",
        "t.data_hora",
        "a.status as aprovacao_status",
        "a.observacao as aprovacao_observacao",
      )
      .orderBy("t.data_hora", "asc");

    return res.json({
      solicitacao,
      itens,
      timeline,
    });
  },

  async create(req, res) {
    const {
      id_projeto,
      id_user,
      titulo,
      descricao,
      atividade_id,
      valor_total,
      local_compra,
      data_prazo,
      criado_por_role,
    } = req.body;

    const [id] = await connection("solicitacoes").insert({
      id_projeto,
      titulo,
      descricao,
      atividade_id,
      valor_total,
      local_compra,
      data_prazo,
      status: "AGUARDANDO_COMITE",
      etapa_atual: "COMITE",
      criado_por_id: id_user,
      criado_por_role,
    });

    return res.json({ id });
  },

  async getAll(req, res) {
    const { id } = req.params;
  
    // Buscar solicitação
    const solicitacao = await connection('solicitacoes')
      .where('id', id)
      .first();
    
    if (!solicitacao) {
      return res.status(404).json({ 
        success: false, 
        error: 'Solicitação não encontrada' 
      });
    }

    // Buscar itens
    const itens = await connection('solicitacao_itens')
      .where('solicitacao_id', id)
      .select('*');

    // Buscar aprovações
    const aprovacoes = await connection('aprovacoes')
      .where('solicitacao_id', id)
      .select('*')
      .orderBy('data_decisao', 'asc');

    // Buscar timeline
    const timeline = await connection('solicitacao_timeline')
      .where('solicitacao_id', id)
      .select('*')
      .orderBy('data_hora', 'asc');

    return res.json({
      success: true,
      data: {
        solicitacao,
        itens,
        aprovacoes,
        timeline
      }
    });
  },
};
