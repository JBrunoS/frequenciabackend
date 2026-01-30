const connection = require("../database/connection");

module.exports = {
  async index(req, res) {
    const { solicitacao_id } = req.params;
    const { id_projeto } = req.query;

    const aprovacoes = await connection("aprovacoes")
      .where({ solicitacao_id, id_projeto })
      .orderBy("data_decisao", "asc");

    return res.json(aprovacoes);
  },

  async create(req, res) {
    const {
      id_projeto,
      id_user,
      solicitacao_id,
      etapa,
      role,
      status,
      observacao,
      aprovado_por_nome,
    } = req.body;

    /* =========================
     1. REGISTRA A DECISÃO
  ========================= */
    await connection("aprovacoes").insert({
      id_projeto,
      solicitacao_id,
      etapa,
      role,
      status,
      observacao,
      aprovado_por_id: id_user,
      aprovado_por_nome,
      data_decisao: connection.fn.now(),
    });

    await connection("solicitacao_timeline").insert({
      solicitacao_id,
      etapa,
      acao: status === "APROVADO" ? "Aprovado" : "Recusado",
      descricao: observacao || "Decisão registrada",
      usuario_id: id_user,
      usuario_nome: aprovado_por_nome,
      usuario_role: role,
      data_hora: connection.fn.now(),
    });

    /* =========================
     2. RECUSA (encerra fluxo)
  ========================= */
    if (status === "RECUSADO") {
      await connection("solicitacoes")
        .where({ id: solicitacao_id, id_projeto })
        .update({
          status: "RECUSADO",
          etapa_atual: "ENCERRADO",
        });

      return res.status(201).send();
    }

    /* =========================
     3. APROVAÇÃO (avança)
  ========================= */
    if (status === "APROVADO") {
      // Comitê → Financeiro
      if (etapa === "COMITE") {
        await connection("solicitacoes")
          .where({ id: solicitacao_id, id_projeto })
          .update({
            status: "APROVADO_COMITE",
            etapa_atual: "FINANCEIRO",
          });

        await connection("solicitacao_timeline").insert({
          solicitacao_id,
          etapa: "FINANCEIRO",
          acao: "Encaminhado ao Financeiro",
          descricao: "Solicitação aprovada pelo Comitê",
          usuario_id: id_user,
          usuario_nome: aprovado_por_nome,
          usuario_role: role,
          data_hora: connection.fn.now(),
        });
      }

      // Financeiro → Presidência
      if (etapa === "FINANCEIRO") {
        await connection("solicitacoes")
          .where({ id: solicitacao_id, id_projeto })
          .update({
            status: "AGUARDANDO_PRESIDENCIA",
            etapa_atual: "PRESIDENCIA",
          });

        await connection("solicitacao_timeline").insert({
          solicitacao_id,
          etapa: "PRESIDENCIA",
          acao: "Encaminhado à Presidência",
          descricao: "Pagamento realizado pelo Financeiro",
          usuario_id: id_user,
          usuario_nome: aprovado_por_nome,
          usuario_role: role,
          data_hora: connection.fn.now(),
        });
      }

      // Presidência → Finaliza
      if (etapa === "PRESIDENCIA") {
        await connection("solicitacoes")
          .where({ id: solicitacao_id, id_projeto })
          .update({
            status: "FINALIZADO",
            etapa_atual: "ENCERRADO",
          });

        await connection("solicitacao_timeline").insert({
          solicitacao_id,
          etapa: "FINALIZADO",
          acao: "Assinado pela Presidência",
          descricao: "Presidência assinou o documento e confirmou todas as operações",
          usuario_id: id_user,
          usuario_nome: aprovado_por_nome,
          usuario_role: role,
          data_hora: connection.fn.now(),
        });
      }
    }

    return res.status(201).send();
  },

  async listarFinanceiro(req, res) {
    const { id_projeto } = req.query;

    const solicitacoes = await connection("solicitacoes")
      .where({
        id_projeto,
        status: "AGUARDANDO_FINANCEIRO",
      })
      .orderBy("created_at", "desc");

    return res.json(solicitacoes);
  },
};
