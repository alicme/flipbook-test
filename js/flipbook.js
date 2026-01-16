const pdfUrl = './pdf/deneme-flipbook.pdf';
const container = document.getElementById('book');

const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const zoomInBtn = document.getElementById('zoomIn');
const zoomOutBtn = document.getElementById('zoomOut');
const pageInfo = document.getElementById('pageInfo');
const soundToggle = document.getElementById('soundToggle');

let pdfDoc = null;
let currentPage = 1;
let scale = 1.2;

let soundEnabled = true;
const flipSound = new Audio('./sound/page-flip.mp3');

/* ---------------- PDF LOAD ---------------- */

pdfjsLib.getDocument(pdfUrl).promise
  .then(pdf => {
    pdfDoc = pdf;
    renderPage(currentPage);
    updatePageInfo();
  })
  .catch(err => {
    console.error('PDF yüklenemedi:', err);
  });

/* ---------------- RENDER ---------------- */

function renderPage(num) {
  pdfDoc.getPage(num).then(page => {
    container.innerHTML = '';

    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    container.appendChild(canvas);

    page.render({
      canvasContext: ctx,
      viewport
    });
  });
}

/* ---------------- UI ---------------- */

function updatePageInfo() {
  pageInfo.textContent = `${currentPage} / ${pdfDoc.numPages}`;
}

function playSound() {
  if (!soundEnabled) return;
  flipSound.currentTime = 0;
  flipSound.play().catch(() => {});
}

/* ---------------- BUTTONS ---------------- */

prevBtn.onclick = () => {
  if (currentPage <= 1) return;
  currentPage--;
  playSound();
  renderPage(currentPage);
  updatePageInfo();
};

nextBtn.onclick = () => {
  if (currentPage >= pdfDoc.numPages) return;
  currentPage++;
  playSound();
  renderPage(currentPage);
  updatePageInfo();
};

zoomInBtn.onclick = () => {
  scale += 0.2;
  renderPage(currentPage);
};

zoomOutBtn.onclick = () => {
  scale = Math.max(0.6, scale - 0.2);
  renderPage(currentPage);
};

soundToggle.onclick = () => {
  soundEnabled = !soundEnabled;
  soundToggle.textContent = soundEnabled ? '🔊' : '🔇';
};

/* ---------------- MOUSE DRAG ---------------- */

let isDragging = false;
let startX = 0;

container.addEventListener('mousedown', e => {
  isDragging = true;
  startX = e.clientX;
});

window.addEventListener('mouseup', e => {
  if (!isDragging) return;
  isDragging = false;

  const diff = e.clientX - startX;
  if (diff > 80) prevBtn.click();
  if (diff < -80) nextBtn.click();
});

/* ---------------- TOUCH SWIPE ---------------- */

let touchStartX = 0;

container.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});

container.addEventListener('touchend', e => {
  const diff = e.changedTouches[0].clientX - touchStartX;
  if (diff > 60) prevBtn.click();
  if (diff < -60) nextBtn.click();
});
