// PDF.js global olarak window.pdfjsLib üzerinden kullanılacak
pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.mjs';

// PDF yolu
const pdfUrl = './pdf/deneme-flipbook.pdf';

// DOM
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

// Render PDF sayfası
async function render(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    // Canvas oluştur
    let canvas = container.querySelector('canvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        container.appendChild(canvas);
    }
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({ canvasContext: context, viewport }).promise;

    pageInfo.textContent = `${pageNum} / ${pdfDoc.numPages}`;
}

// PDF yükle
pdfjsLib.getDocument(pdfUrl).promise.then(doc => {
    pdfDoc = doc;
    render(currentPage);
});

// Eventler
prevBtn.addEventListener('click', () => {
    if (currentPage <= 1) return;
    currentPage--;
    render(currentPage);
});

nextBtn.addEventListener('click', () => {
    if (currentPage >= pdfDoc.numPages) return;
    currentPage++;
    render(currentPage);
});

zoomInBtn.addEventListener('click', () => {
    scale += 0.2;
    render(currentPage);
});

zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(0.2, scale - 0.2);
    render(currentPage);
});

// Ses butonu (şimdilik sadece toggle UI)
soundToggle.addEventListener('click', () => {
    alert('Ses efekti şimdilik kapalı. İleride aktif olacak.');
});
