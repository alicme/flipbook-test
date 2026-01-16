// ===============================
// PDF FLIPBOOK - FINAL VERSION
// ===============================

// PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

// PDF yolu
const pdfUrl = "./pdf/deneme-flipbook.pdf";

// DOM
const container = document.getElementById("book");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const pageInfo = document.getElementById("pageInfo");

// Ayarlar
let pdfDoc = null;
let currentPage = 1;
let scale = 1.4;

// ===============================
// PDF YÜKLE
// ===============================
pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
  pdfDoc = pdf;
  renderPage(currentPage);
  updatePageInfo();
});

// ===============================
// SAYFA ÇİZ
// ===============================
function renderPage(num) {
  container.innerHTML = "";

  pdfDoc.getPage(num).then((page) => {
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.className = "page";

    container.appendChild(canvas);

    page.render({
      canvasContext: ctx,
      viewport: viewport,
    });
  });
}

// ===============================
// SAYFA BİLGİ
// ===============================
function updatePageInfo() {
  pageInfo.textContent = `${currentPage} / ${pdfDoc.numPages}`;
}

// ===============================
// BUTONLAR
// ===============================
prevBtn.onclick = () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderPage(currentPage);
  updatePageInfo();
};

nextBtn.onclick = () => {
  if (currentPage >= pdfDoc.numPages) return;
  currentPage++;
  renderPage(currentPage);
  updatePageInfo();
};

zoomInBtn.onclick = () => {
  scale += 0.2;
  renderPage(currentPage);
};

zoomOutBtn.onclick = () => {
  if (scale <= 0.6) return;
  scale -= 0.2;
  renderPage(currentPage);
};
