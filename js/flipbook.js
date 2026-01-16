// PDF.js legacy global kullanımı
pdfjsLib.GlobalWorkerOptions.workerSrc = './js/pdf.worker.js';

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
let pages = []; // canvas listesi

// PDF yükleme ve sayfa canvas oluşturma
pdfjsLib.getDocument(pdfUrl).promise.then(doc => {
    pdfDoc = doc;
    pageInfo.textContent = `1 / ${pdfDoc.numPages}`;
    for (let i = 1; i <= pdfDoc.numPages; i++) {
        createPageCanvas(i);
    }
    showPages();
});

// Canvas oluşturma
async function createPageCanvas(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    canvas.classList.add('page');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    canvas.dataset.page = pageNum;

    const context = canvas.getContext('2d');
    await page.render({ canvasContext: context, viewport }).promise;

    container.appendChild(canvas);
    pages.push(canvas);
}

// Sayfaları gösterme (tek/çift sayfa)
function showPages() {
    const isLandscape = window.innerWidth > window.innerHeight;
    pages.forEach((canvas, idx) => {
        canvas.style.display = 'none';
        canvas.style.transform = 'translateX(0)';
    });

    // Kapak her zaman tek
    pages[0].style.display = 'block';

    if (currentPage === 1) return;

    if (isLandscape) {
        // çift sayfa
        let left = pages[currentPage - 1];
        let right = pages[currentPage] || null;
        if (left) left.style.display = 'block';
        if (right) right.style.display = 'block';
    } else {
        // tek sayfa
        let page = pages[currentPage - 1];
        if (page) page.style.display = 'block';
    }

    pageInfo.textContent = `${currentPage} / ${pdfDoc.numPages}`;
}

// Eventler
prevBtn.addEventListener('click', () => {
    if (currentPage > 1) currentPage--;
    showPages();
});

nextBtn.addEventListener('click', () => {
    if (currentPage < pdfDoc.numPages) currentPage++;
    showPages();
});

zoomInBtn.addEventListener('click', () => {
    scale += 0.2;
    reloadPages();
});

zoomOutBtn.addEventListener('click', () => {
    scale = Math.max(0.2, scale - 0.2);
    reloadPages();
});

soundToggle.addEventListener('click', () => {
    alert('Ses efekti şimdilik kapalı. İleride aktif olacak.');
});

// sayfaları yeniden çiz
async function reloadPages() {
    for (let i = 0; i < pages.length; i++) {
        const page = await pdfDoc.getPage(i+1);
        const viewport = page.getViewport({ scale });
        const canvas = pages[i];
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
    }
    showPages();
}

// resize responsive
window.addEventListener('resize', showPages);
