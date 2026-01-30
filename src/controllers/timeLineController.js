const connection = require('../database/connection');

module.exports = {

  async index(req, res) {
    const { solicitacao_id } = req.params;
    const { id_projeto } = req.query;

    const timeline = await connection('solicitacao_timeline')
      .where({ solicitacao_id, id_projeto })
      .orderBy('data_hora', 'asc');

    return res.json(timeline);
  },

  async create(req, res) {
    const {
      id_projeto,
      solicitacao_id,
      nome_professor,
      criado_por_role,
    } = req.body;

    const solicitacao = await connection('solicitacoes')
        .where({ id: solicitacao_id}, { id_projeto }) 
        .first()

    console.log(solicitacao)

    await connection('solicitacao_timeline').insert({
      id_projeto: id_projeto,
      solicitacao_id: solicitacao_id,
      etapa: 'SOLICITAÇÃO',
      acao: 'Solicitação Criada',
      descricao: 'Solicitação enviada para análise',
      usuario_id: solicitacao.criado_por_id,
      usuario_nome: nome_professor,
      usuario_role: criado_por_role
    });

    return res.status(201).send();
  }
};
