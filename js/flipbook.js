// PDF URL
const pdfUrl = './pdf/deneme-flipbook.pdf';

// DOM elemanları
const container = document.getElementById('book');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const pageInfo = document.getElementById('pageInfo');
const soundToggle = document.getElementById('soundToggle');

// Flipbook state
let pdfDoc = null;
let currentPage = 1;
let scale = 1.2;
let pages = [];
let isZooming = false;

// Load PDF
pdfjsLib.getDocument(pdfUrl).promise.then(doc => {
  pdfDoc = doc;
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const canvas = document.createElement('canvas');
    canvas.classList.add('pdf-page');
    container.appendChild(canvas);
    pages.push(canvas);
  }
  renderPage(currentPage);
});

// Render a page
function renderPage(pageNum) {
  if (!pdfDoc) return;
  pdfDoc.getPage(pageNum).then(page => {
    const canvas = pages[pageNum - 1];
    const ctx = canvas.getContext('2d');
    const viewport = page.getViewport({ scale: scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    page.render({ canvasContext: ctx, viewport: viewport }).promise.then(() => {
      pageInfo.textContent = `${currentPage} / ${pdfDoc.numPages}`;
    });
  });
}

// Buttons
prevBtn.addEventListener('click', () => {
  if (currentPage <= 1) return;
  currentPage--;
  renderPage(currentPage);
});

nextBtn.addEventListener('click', () => {
  if (currentPage >= pdfDoc.numPages) return;
  currentPage++;
  renderPage(currentPage);
});

zoomInBtn.addEventListener('click', () => {
  scale += 0.1;
  renderPage(currentPage);
});

zoomOutBtn.addEventListener('click', () => {
  scale = Math.max(0.1, scale - 0.1);
  renderPage(currentPage);
});
