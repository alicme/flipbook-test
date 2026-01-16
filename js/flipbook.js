// PDF dosya yolu
const pdfUrl = "./pdf/deneme-flipbook.pdf";

// DOM ELEMENTLERİ
const container = document.getElementById("book");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const zoomInBtn = document.getElementById("zoomIn");
const zoomOutBtn = document.getElementById("zoomOut");
const pageInfo = document.getElementById("pageInfo");
const soundToggle = document.getElementById("soundToggle");

// SES
let flipSound = new Audio("./sound/page-flip.mp3"); // yoksa hata vermez
let soundEnabled = true;

// Flipbook ayarları
let pdfDoc = null;
let currentPage = 1;
let scale = 1.2;
let pageRendering = false;
let pageNumPending = null;

// SAYFA RENDER
function renderPage(num) {
  pageRendering = true;
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({ scale: scale });
    let canvas = container.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      container.appendChild(canvas);
    }
    const context = canvas.getContext("2d");
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport
    };

    const renderTask = page.render(renderContext);

    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    });

    pageInfo.textContent = `${num} / ${pdfDoc.numPages}`;

    if (soundEnabled) flipSound.play();
  });
}

function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

// SAYFA GEÇİŞİ
function onPrevPage() {
  if (currentPage <= 1) return;
  currentPage--;
  queueRenderPage(currentPage);
}

function onNextPage() {
  if (currentPage >= pdfDoc.numPages) return;
  currentPage++;
  queueRenderPage(currentPage);
}

// ZOOM
function onZoomIn() {
  scale += 0.2;
  queueRenderPage(currentPage);
}

function onZoomOut() {
  scale = Math.max(0.2, scale - 0.2);
  queueRenderPage(currentPage);
}

// SES TOGGLE
function onSoundToggle() {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? "🔊" : "🔇";
}

// EVENT LISTENER
prevBtn.addEventListener("click", onPrevPage);
nextBtn.addEventListener("click", onNextPage);
zoomInBtn.addEventListener("click", onZoomIn);
zoomOutBtn.addEventListener("click", onZoomOut);
soundToggle.addEventListener("click", onSoundToggle);

// MOBILE SWIPE
let startX = 0;
container.addEventListener("touchstart", (e) => {
  startX = e.touches[0].clientX;
});
container.addEventListener("touchend", (e) => {
  let diff = e.changedTouches[0].clientX - startX;
  if (diff > 30) onPrevPage();
  if (diff < -30) onNextPage();
});

// PDF YÜKLEME
pdfjsLib.getDocument(pdfUrl).promise.then(function(pdf) {
  pdfDoc = pdf;
  currentPage = 1;
  renderPage(currentPage);
}).catch(err => {
  container.textContent = "PDF yüklenemedi: " + err.message;
});
