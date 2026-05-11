/ controllers/PDFController.js
const connection = require("../database/connection");
const gerarPDF = require("../utils/gerarPDFBackend");
 
module.exports = {
  async gerar(req, res) {
    const { solicitacao_id } = req.params;
    const { id_projeto } = req.query;
 
    try {
const solicitacao = await connection("solicitacoes as s")
  .leftJoin("atividades as a", "a.id", "s.atividade_id")
  .select(
    "s.*",
    "a.nome as atividade_nome",
    "a.area",
    "a.custo as atividade_custo",
  ) // &#9989; seleciona só os campos necessários da atividade, sem sobrescrever s.status
  .where({
    "s.id": solicitacao_id,
    "s.id_projeto": id_projeto,
  })
  .first();
 
      const itens = await connection("solicitacao_itens").where({
        solicitacao_id,
      });
 
      const aprovacoes = await connection("aprovacoes").where({
        solicitacao_id,
      });
 
      const timeline = await connection("solicitacao_timeline").where({
        solicitacao_id,
      });
 
      const dados = { solicitacao, itens, aprovacoes, timeline };
 
      const pdfBuffer = gerarPDF(dados);
 
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename=autorizacao_${solicitacao.titulo.replace(/\s+/g, "_") || solicitacao_id}.pdf`
      );
 
      return res.send(Buffer.from(pdfBuffer));
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao gerar PDF" });
    }
  },
};