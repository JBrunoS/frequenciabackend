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
     VALIDAÇÃO
  ========================= */
  if (!id_projeto || !id_user || !solicitacao_id || !etapa || !role || !status) {
    return res.status(400).json({ erro: "Campos obrigatórios faltando" });
  }
 
  const _id_projeto = Number(id_projeto);
  const _id_user = Number(id_user);
  const _solicitacao_id = Number(solicitacao_id);
 
  /* =========================
     HELPER TIMELINE
  ========================= */
  function timelinePayload(etapa, acao, descricao) {
    return {
      solicitacao_id: _solicitacao_id,
      id_projeto: _id_projeto,
      etapa,
      acao,
      descricao,
      usuario_id: _id_user,
      usuario_nome: aprovado_por_nome,
      usuario_role: role,
      data_hora: connection.fn.now(),
    };
  }
 
  /* =========================
     TRANSACTION
  ========================= */
  try {
    await connection.transaction(async (trx) => {
 
      // 1. REGISTRA A DECISÃO
      await trx("aprovacoes").insert({
        id_projeto: _id_projeto,
        solicitacao_id: _solicitacao_id,
        etapa,
        role,
        status,
        observacao,
        aprovado_por_id: _id_user,
        aprovado_por_nome,
        data_decisao: connection.fn.now(),
      });
 
      await trx("solicitacao_timeline").insert(
        timelinePayload(
          etapa,
          status === "APROVADO" ? "Aprovado" : "Recusado",
          observacao || "Decisão registrada"
        )
      );
 
      // 2. RECUSA (encerra fluxo)
      if (status === "RECUSADO") {
        await trx("solicitacoes")
          .where({ id: _solicitacao_id, id_projeto: _id_projeto })
          .update({
            status: "RECUSADO",
            etapa_atual: "ENCERRADO",
          });
 
        return; // encerra a transaction aqui
      }
 
      // 3. APROVAÇÃO (avança fluxo)
      if (status === "APROVADO") {
 
        // Comitê &#8594; Financeiro
        if (etapa === "COMITE") {
          await trx("solicitacoes")
            .where({ id: _solicitacao_id, id_projeto: _id_projeto })
            .update({
              status: "APROVADO_COMITE",
              etapa_atual: "FINANCEIRO",
            });
 
          await trx("solicitacao_timeline").insert(
            timelinePayload(
              "FINANCEIRO",
              "Encaminhado ao Financeiro",
              "Solicitação aprovada pelo Comitê"
            )
          );
        }
 
        // Financeiro &#8594; Presidência
        if (etapa === "FINANCEIRO") {
          await trx("solicitacoes")
            .where({ id: _solicitacao_id, id_projeto: _id_projeto })
            .update({
              status: "AGUARDANDO_PRESIDENCIA",
              etapa_atual: "PRESIDENCIA",
            });
 
          await trx("solicitacao_timeline").insert(
            timelinePayload(
              "PRESIDENCIA",
              "Encaminhado à Presidência",
              "Pagamento realizado pelo Financeiro"
            )
          );
        }
 
        // Presidência &#8594; Finaliza
        if (etapa === "PRESIDENCIA") {
          await trx("solicitacoes")
            .where({ id: _solicitacao_id, id_projeto: _id_projeto })
            .update({
              status: "FINALIZADO",
              etapa_atual: "ENCERRADO",
            });
 
          await trx("solicitacao_timeline").insert(
            timelinePayload(
              "FINALIZADO",
              "Assinado pela Presidência",
              "Presidência assinou o documento e confirmou todas as operações"
            )
          );
        }
      }
    });
 
    return res.status(201).send();
 
  } catch (err) {
    console.error("&#10060; ERRO no create aprovacao:", err.message);
    return res.status(500).json({ erro: err.message });
  }
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