// Cores padrão das fibras (exemplo comum em cabos)
const fiberColors = [
  "Azul", "Laranja", "Verde", "Marrom", "Cinza",
  "Branco", "Vermelho", "Preto", "Amarelo", "Violeta",
  "Rosa", "Turquesa"
];

// Cores padrão dos grupos (tubos)
const groupColors = [
  "Azul", "Laranja", "Verde", "Marrom", "Cinza",
  "Branco", "Vermelho", "Preto", "Amarelo", "Violeta",
  "Rosa", "Turquesa"
];

// Pega elementos do DOM
const form = document.getElementById("fibraForm");
const resultSection = document.getElementById("result");
const fiberPositionEl = document.getElementById("fiberPosition");
const fiberColorEl = document.getElementById("fiberColor");
const fiberNumEl = document.getElementById("fiberNum");
const groupNumberEl = document.getElementById("groupNumber");
const groupColorEl = document.getElementById("groupColor");
const historyTableBody = document.querySelector("#historyTable tbody");
const exportCSVBtn = document.getElementById("exportCSV");
const exportPDFBtn = document.getElementById("exportPDF");

// Histórico de fibras
let history = [];

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fiberNumber = Number(form.fiberNumber.value);
  const cableType = Number(form.cableType.value);
  const fibersPerTube = Number(form.fibersPerTube.value);
  const projectName = form.projectName.value.trim();
  const cableNumber = form.cableNumber.value.trim();
  const boxName = form.boxName.value.trim();

  if (fiberNumber < 1 || fiberNumber > cableType) {
    alert(`Número da fibra inválido! Deve ser entre 1 e ${cableType}.`);
    return;
  }

  // Calcula grupo e cor do grupo
  // Cada grupo tem fibersPerTube fibras
  const groupNumber = Math.ceil(fiberNumber / fibersPerTube);

  // Cor do grupo (ajustando índice)
  const groupColor = groupColors[(groupNumber - 1) % groupColors.length];

  // Posição dentro do grupo (1 a fibersPerTube)
  const positionInGroup = fiberNumber - (groupNumber - 1) * fibersPerTube;

  // Cor da fibra (ajustando índice)
  const fiberColor = fiberColors[(positionInGroup - 1) % fiberColors.length];

  // Exibe resultado
  fiberPositionEl.textContent = positionInGroup;
  fiberColorEl.textContent = fiberColor;
  fiberNumEl.textContent = fiberNumber;
  groupNumberEl.textContent = groupNumber;
  groupColorEl.textContent = groupColor;

  resultSection.classList.remove("hidden");

  // Adiciona ao histórico
  const entry = {
    projectName: projectName || "-",
    cableNumber: cableNumber || "-",
    boxName: boxName || "-",
    fiberNumber,
    fiberPosition: positionInGroup,
    fiberColor,
    groupNumber,
    groupColor,
  };
  history.push(entry);
  updateHistoryTable();
});

// Atualiza a tabela do histórico
function updateHistoryTable() {
  historyTableBody.innerHTML = "";
  history.forEach((item, i) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.projectName}</td>
      <td>${item.cableNumber}</td>
      <td>${item.boxName}</td>
      <td>${item.fiberNumber}</td>
      <td>${item.fiberPosition}</td>
      <td>${item.fiberColor}</td>
      <td>${item.groupNumber}</td>
      <td>${item.groupColor}</td>
    `;
    historyTableBody.appendChild(row);
  });
}

// Exportar CSV
exportCSVBtn.addEventListener("click", () => {
  if (history.length === 0) {
    alert("⚠️ Histórico vazio!");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent +=
    "Projeto,Cabo,Caixa,Fibra,Posição,Cor Fibra,Grupo,Cor Grupo\n";

  history.forEach((row) => {
    const rowData = [
      row.projectName,
      row.cableNumber,
      row.boxName,
      row.fiberNumber,
      row.fiberPosition,
      row.fiberColor,
      row.groupNumber,
      row.groupColor,
    ];
    csvContent += rowData.join(",") + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "historico_fibras.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Exportar PDF simples (usando jsPDF)
exportPDFBtn.addEventListener("click", () => {
  if (history.length === 0) {
    alert("⚠️ Histórico vazio!");
    return;
  }

  // Carregamos o jsPDF dinamicamente para não pesar no começo
  if (typeof jsPDF === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    script.onload = generatePDF;
    document.body.appendChild(script);
  } else {
    generatePDF();
  }
});

function generatePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Histórico de Fibras Ópticas 📜", 14, 22);
  doc.setFontSize(12);

  const headers = ["Projeto", "Cabo", "Caixa", "Fibra", "Posição", "Cor Fibra", "Grupo", "Cor Grupo"];
  const rows = history.map(item => [
    item.projectName,
    item.cableNumber,
    item.boxName,
    item.fiberNumber.toString(),
    item.fiberPosition.toString(),
    item.fiberColor,
    item.groupNumber.toString(),
    item.groupColor,
  ]);

  // AutoTable simplificado (se não quiser puxar biblioteca extra, vamos fazer simples)
  let startY = 30;
  const lineHeight = 8;
  
  // Cabeçalho
  headers.forEach((h, i) => {
    doc.text(h, 14 + i * 22, startY);
  });
  startY += lineHeight;

  // Conteúdo
  rows.forEach(row => {
    row.forEach((cell, i) => {
      doc.text(cell, 14 + i * 22, startY);
    });
    startY += lineHeight;
    if (startY > 280) {
      doc.addPage();
      startY = 20;
    }
  });

  doc.save("historico_fibras.pdf");
}
