const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable").default;

const COR_LARANJA = [241, 129, 64];
const COR_LARANJA_CLARO = [253, 235, 220];
const COR_CINZA_ESCURO = [50, 50, 50];
const COR_CINZA_MEDIO = [100, 100, 100];
const COR_CINZA_CLARO = [240, 240, 240];
const COR_VERDE = [46, 125, 50];
const COR_VERMELHO = [198, 40, 40];
const COR_AMARELO = [245, 127, 23];
const COR_BRANCO = [255, 255, 255];

function setFill(doc, cor) {
  doc.setFillColor(cor[0], cor[1], cor[2]);
}
function setTexto(doc, cor) {
  doc.setTextColor(cor[0], cor[1], cor[2]);
}

function formatarData(valor) {
  if (!valor) return "N/A";
  return new Date(valor).toLocaleDateString("pt-BR");
}

function formatarDataHora(valor) {
  if (!valor) return "N/A";
  return new Date(valor).toLocaleString("pt-BR");
}

function formatarMoeda(valor) {
  return `R$ ${parseFloat(valor || 0).toFixed(2)}`;
}

function corStatus(status) {
  if (status === "APROVADO" || status === "FINALIZADO") return COR_VERDE;
  if (status === "RECUSADO") return COR_VERMELHO;
  return COR_AMARELO;
}

function traduzirStatus(status) {
  const map = {
    AGUARDANDO_COMITE: "Aguardando Comite",
    AGUARDANDO_PRESIDENCIA: "Aguardando Presidencia",
    AGUARDANDO_PAGAMENTO: "Aguardando Pagamento",
    APROVADO_COMITE: "Aprovado pelo Comite",
    FINALIZADO: "Finalizado",
    RECUSADO: "Recusado",
    ENCERRADO: "Encerrado",
  };
  return map[status] || status || "N/A";
}

function secao(doc, titulo, y) {
  setFill(doc, COR_LARANJA);
  doc.rect(14, y, 182, 8, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  setTexto(doc, COR_BRANCO);
  doc.text(titulo.toUpperCase(), 18, y + 5.5);
  setTexto(doc, COR_CINZA_ESCURO);
  return y + 11;
}

module.exports = function gerarPDF(dados) {
  try {
    const { solicitacao, itens, aprovacoes, timeline } = dados;

    const doc = new jsPDF();
    let y = 0;

    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    // CABECALHO
    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    setFill(doc, COR_LARANJA);
    doc.rect(0, 0, 210, 22, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    setTexto(doc, COR_BRANCO);
    doc.text("PEV - Projeto Ensinando a Viver", 105, 9, { align: "center" });

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.text("Autorizacao de Compras", 105, 17, { align: "center" });

    y = 28;

    // Badge de status
    const statusLabel = traduzirStatus(solicitacao.status);
    const corBadge = corStatus(solicitacao.status);
    setFill(doc, corBadge);
    doc.roundedRect(14, y, 55, 7, 2, 2, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    setTexto(doc, COR_BRANCO);
    doc.text(statusLabel, 41, y + 5, { align: "center" });

    y += 12;

    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    // DADOS DA SOLICITACAO
    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    y = secao(doc, "Dados da Solicitacao", y);

    const dadosList = [
      ["ID:", `#${solicitacao.id}`],
      ["Data:", formatarData(solicitacao.data_criacao)],
      ["Titulo:", solicitacao.titulo || "N/A"],
      ["Atividade:", solicitacao.nome || "N/A"],
      ["Area:", solicitacao.area || "N/A"],
      ["Local de Compra:", solicitacao.local_compra || "N/A"],
      ["Prazo:", formatarData(solicitacao.data_prazo)],
      ["Solicitante:", solicitacao.criado_por_role || "N/A"],
      ["Descricao:", solicitacao.descricao || "N/A"],
    ];

    autoTable(doc, {
      startY: y,
      head: [],
      body: dadosList,
      theme: "plain",
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: "bold", textColor: COR_CINZA_MEDIO, cellWidth: 38 },
        1: { textColor: COR_CINZA_ESCURO, cellWidth: 144 },
      },
      alternateRowStyles: { fillColor: COR_CINZA_CLARO },
      margin: { left: 14, right: 14 },
      tableWidth: 182,
    });

    y = doc.lastAutoTable.finalY + 10;

    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    // ITENS
    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    y = secao(doc, "Itens da Solicitacao", y);

    const itensData = itens.map((item) => [
      item.descricao || item.nome || "N/A",
      `${item.quantidade || 0}`,
      formatarMoeda(item.valor_unitario || item.preco_unitario),
      formatarMoeda(
        item.valor_total ||
          item.preco_total ||
          item.quantidade * (item.valor_unitario || item.preco_unitario),
      ),
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Descricao", "Qtd", "Preco Unit.", "Total"]],
      body: itensData,
      theme: "grid",
      headStyles: {
        fillColor: COR_LARANJA,
        textColor: COR_BRANCO,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: { fontSize: 9, textColor: COR_CINZA_ESCURO },
      alternateRowStyles: { fillColor: COR_CINZA_CLARO },
      columnStyles: {
        0: { cellWidth: 86 },
        1: { cellWidth: 18, halign: "center" },
        2: { cellWidth: 38, halign: "right" },
        3: { cellWidth: 40, halign: "right", fontStyle: "bold" },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 182,
    });

    y = doc.lastAutoTable.finalY + 4;

    // Total
    const valorTotal = itens.reduce((sum, item) => {
      return (
        sum +
        parseFloat(
          item.valor_total ||
            item.preco_total ||
            item.quantidade * (item.valor_unitario || item.preco_unitario) ||
            0,
        )
      );
    }, 0);

    setFill(doc, COR_LARANJA_CLARO);
    doc.rect(120, y, 76, 9, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    setTexto(doc, COR_CINZA_ESCURO);
    doc.text("Valor Total:", 124, y + 6);
    doc.setTextColor(180, 80, 20);
    doc.text(formatarMoeda(valorTotal), 192, y + 6, { align: "right" });

    y += 16;

    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    // NOVA PAGINA
    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    doc.addPage();
    y = 20;

    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    // HISTORICO
    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    y = secao(doc, "Historico da Solicitacao", y);

    const timelineData = timeline.map((t) => [
      t.etapa || "N/A",
      t.acao || "N/A",
      t.usuario_nome || "N/A",
      formatarDataHora(t.data_hora),
      t.descricao || "",
    ]);

    autoTable(doc, {
      startY: y,
      head: [["Etapa", "Acao", "Usuario", "Data/Hora", "Descricao"]],
      body: timelineData,
      theme: "grid",
      headStyles: {
        fillColor: COR_LARANJA,
        textColor: COR_BRANCO,
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: COR_CINZA_ESCURO },
      alternateRowStyles: { fillColor: COR_CINZA_CLARO },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 25 },
        2: { cellWidth: 40 },
        3: { cellWidth: 35 },
        4: { cellWidth: 57 },
      },
      margin: { left: 14, right: 14 },
      tableWidth: 182,
    });

    y = doc.lastAutoTable.finalY + 14;

    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    // APROVACOES
    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    y = secao(doc, "Aprovacoes e Assinaturas", y);

    const todasAprovacoes = [];

    if (timeline[0]) {
      const t = timeline[0];
      todasAprovacoes.push([
        t.etapa || "N/A",
        t.acao || "N/A",
        t.usuario_nome || "N/A",
        formatarDataHora(t.data_hora),
        "",
      ]);
    }

    aprovacoes.forEach((a) => {
      todasAprovacoes.push([
        a.etapa || "N/A",
        a.role || "N/A",
        a.aprovado_por_nome || "Aguardando",
        formatarDataHora(a.data_decisao),
        a.observacao || "",
      ]);
    });

    autoTable(doc, {
      startY: y,
      head: [["Etapa", "Funcao", "Responsavel", "Data", "Observacao"]],
      body: todasAprovacoes,
      theme: "grid",
      headStyles: {
        fillColor: COR_LARANJA,
        textColor: COR_BRANCO,
        fontStyle: "bold",
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: COR_CINZA_ESCURO },
      alternateRowStyles: { fillColor: COR_CINZA_CLARO },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 28 },
        2: { cellWidth: 42 },
        3: { cellWidth: 35 },
        4: { cellWidth: 52 },
      },
      willDrawCell: (data) => {
        if (data.section === "body" && data.column.index === 1) {
          const valor = todasAprovacoes[data.row.index][1];
          if (valor === "APROVADO") {
            doc.setTextColor(COR_VERDE[0], COR_VERDE[1], COR_VERDE[2]);
          } else if (valor === "RECUSADO") {
            doc.setTextColor(COR_VERMELHO[0], COR_VERMELHO[1], COR_VERMELHO[2]);
          } else {
            doc.setTextColor(COR_AMARELO[0], COR_AMARELO[1], COR_AMARELO[2]);
          }
        }
      },
      margin: { left: 14, right: 14 },
      tableWidth: 182,
    });

    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    // RODAPE
    // &#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;&#9552;
    const totalPaginas = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPaginas; i++) {
      doc.setPage(i);
      setFill(doc, COR_CINZA_CLARO);
      doc.rect(0, 287, 210, 10, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "normal");
      setTexto(doc, COR_CINZA_MEDIO);
      doc.text(
        `Pagina ${i} de ${totalPaginas}  -  Gerado em ${new Date().toLocaleString("pt-BR")}  -  PEV - Projeto Ensinando a Viver`,
        105,
        293,
        { align: "center" },
      );
    }
    console.log("status:", solicitacao.status);
    console.log("corBadge:", corBadge);
    console.log("statusLabel:", statusLabel);

    return doc.output("arraybuffer");
  } catch (err) {
    console.error("ERRO ao gerar PDF:", err.message);
    console.error(err.stack);
    throw err;
  }
};
