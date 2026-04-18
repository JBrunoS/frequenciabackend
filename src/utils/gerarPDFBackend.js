const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable").default;

module.exports = function gerarPDF(dados) {
  const { solicitacao, itens, aprovacoes, timeline } = dados;

  const doc = new jsPDF();
  let yPos = 20;

  // ============ CABEÇALHO ============
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("PEV - Projeto Ensinando a Viver", 105, yPos, { align: "center" });
  yPos += 8;

  doc.setFontSize(14);
  doc.text("Autorização de Compras", 105, yPos, { align: "center" });
  yPos += 10;

  // ============ DADOS DA SOLICITAÇÃO ============
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Dados da Solicitação", 14, yPos);
  yPos += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const dadosSolicitacao = [
    ["ID:", solicitacao.id || "N/A"],
    ["Atividade:", solicitacao.nome || "N/A"],
    ["Área:", solicitacao.area || "N/A"],
    ["Local de Compra:", solicitacao.local_compra || "N/A"],
    ["Prazo de realização:", new Date(solicitacao.data_prazo).toLocaleDateString('pt-BR') || "N/A"],
    ["Titulo:", solicitacao.titulo || "N/A"],
    ["Descrição:", solicitacao.descricao || "N/A"],
    ["Status:", solicitacao.etapa_atual || solicitacao.status || "N/A"],
    ["Solicitante:", solicitacao.criado_por_role || "N/A"],
    ["Data de Criação:", new Date(solicitacao.data_criacao).toLocaleDateString('pt-BR') || "N/A"],
  ];

  autoTable(doc, {
    startY: yPos,
    head: [],
    body: dadosSolicitacao,
    theme: "striped",
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 40 },
      1: { cellWidth: 140 },
    },
    margin: { left: 14 },
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ============ ITENS ============
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Itens da Solicitação", 14, yPos);
  yPos += 5;

  const itensData = itens.map((item) => [
    item.descricao || item.nome || "N/A",
    `${item.quantidade || 0} un`,
    `R$ ${parseFloat(item.preco_unitario || item.valor_unitario || 0).toFixed(2)}`,
    `R$ ${parseFloat(item.preco_total || item.valor_total || item.quantidade * item.preco_unitario || 0).toFixed(2)}`,
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Descrição", "Qtd", "Preço", "Total"]],
    body: itensData,
    theme: "grid",
    headStyles: { fillColor: [242, 159, 46] },
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 8,
      overflow: "linebreak",
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 70 }, // descrição
      1: { cellWidth: 20 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
    },
    tableWidth: 'auto'
  });

  yPos = doc.lastAutoTable.finalY + 5;

  // Valor Total
  const valorTotal = itens.reduce((sum, item) => {
    const total =
      item.preco_total ||
      item.valor_total ||
      item.quantidade * (item.preco_unitario || item.valor_unitario) ||
      0;
    return sum + parseFloat(total);
  }, 0);

  doc.setFont("helvetica", "bold");
  doc.text(`Valor Total: R$ ${valorTotal.toFixed(2)}`, 14, yPos);
  yPos += 15;

  // ============ NOVA PÁGINA PARA HISTÓRICO ============
  doc.addPage();
  yPos = 20;

  // ============ HISTÓRICO (TIMELINE) ============
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Histórico da Solicitação", 14, yPos);
  yPos += 5;

  const timelineData = timeline.map((t) => [
    t.etapa || "N/A",
    t.acao || "N/A",
    t.usuario_nome || "N/A",
    t.data_hora ? new Date(t.data_hora).toLocaleString("pt-BR") : "N/A",
    t.descricao || "",
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Etapa", "Ação", "Usuário", "Data", "Descrição"]],
    body: timelineData,
    theme: "grid",
    headStyles: { fillColor: [242, 159, 46] },
    margin: { left: 14, right: 14 },
    styles: {
      fontSize: 7,
      overflow: "linebreak",
      cellPadding: 2,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
      4: { cellWidth: 50 }, // descrição maior
    },
    tableWidth: 'auto'
  });

  yPos = doc.lastAutoTable.finalY + 15;

  // ============ APROVAÇÕES (ASSINATURAS) ============
  if (aprovacoes && aprovacoes.length > 0) {
    // Adiciona nova página se necessário
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    const primeiraAcao = timeline?.[0]

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Aprovações e Assinaturas", 14, yPos);
    yPos += 10;

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.5);
    doc.rect(15, yPos, 182, 35);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(
      `${primeiraAcao.etapa || "N/A"} - ${primeiraAcao.acao || "N/A"}`,
      18,
      yPos + 8,
    );

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    doc.setTextColor(76, 175, 80);
    doc.setFont("helvetica", "bold");
    doc.text(`Status: ${primeiraAcao.acao || "PENDENTE"}`, 18, yPos + 15);

    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Responsável: ${primeiraAcao.usuario_nome || "Aguardando"}`,
      18,
      yPos + 21,
    );
    doc.text(
      `Data: ${primeiraAcao.data_hora ? new Date(primeiraAcao.data_hora).toLocaleString("pt-BR") : "Pendente"}`,
      18,
      yPos + 27,
    );

    yPos += 45;

    aprovacoes.forEach((aprovacao, index) => {
      // Verifica se precisa de nova página
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      // Box para cada aprovação
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.5);
      doc.rect(15, yPos, 182, aprovacao.observacao ? 40 : 35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(
        `${aprovacao.etapa || "N/A"} - ${aprovacao.role || "N/A"}`,
        18,
        yPos + 8,
      );

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);

      const statusColor =
        aprovacao.status === "APROVADO"
          ? [76, 175, 80]
          : aprovacao.status === "RECUSADO"
            ? [244, 67, 54]
            : [255, 152, 0];

      doc.setTextColor(...statusColor);
      doc.setFont("helvetica", "bold");
      doc.text(`Status: ${aprovacao.status || "PENDENTE"}`, 18, yPos + 15);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.text(
        `Responsável: ${aprovacao.aprovado_por_nome || "Aguardando"}`,
        18,
        yPos + 21,
      );
      doc.text(
        `Data: ${aprovacao.data_decisao ? new Date(aprovacao.data_decisao).toLocaleString("pt-BR") : "Pendente"}`,
        18,
        yPos + 27,
      );

      if (aprovacao.observacao) {
        doc.setFont("helvetica", "italic");
        const obs =
          aprovacao.observacao.length > 80
            ? aprovacao.observacao.substring(0, 80) + "..."
            : aprovacao.observacao;
        doc.text(`Motivo: ${obs}`, 18, yPos + 33);
      }

      yPos += 45;
    });
  } else {
    doc.setFont("helvetica", "italic");
    doc.setFontSize(10);
    doc.text("Nenhuma aprovação registrada ainda.", 14, yPos);
  }

  // ============ RODAPÉ ============
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount} - Gerado em ${new Date().toLocaleString("pt-BR")}`,
      105,
      285,
      { align: "center" },
    );
  }

  // ============ SALVAR PDF ============

  return doc.output("arraybuffer");
};
