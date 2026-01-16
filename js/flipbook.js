import * as pdfjsLib from "./pdf.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc = "./pdf.worker.mjs";

const pdfUrl = "./pdf/deneme-flipbook.pdf";

let pdfDoc = null;
let pageNum = 1;
let scale = 1.2;
let soundOn = true;

const viewer = document.getElementById("viewer");
const pageInfo = document.getElementById("pageInfo");
const flipSound = document.getElementById("flipSound");

function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

function playSound() {
  if (soundOn) {
    flipSound.currentTime = 0;
    flipSound.play();
  }
}

async function render() {
  viewer.innerHTML = "";

  const pagesToRender = isLandscape() ? 2 : 1;

  for (let i = 0; i < pagesToRender; i++) {
    const pageIndex = pageNum + i;
    if (pageIndex > pdfDoc.numPages) break;

    const page = await pdfDoc.getPage(pageIndex);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: ctx, viewport }).promise;
    viewer.appendChild(canvas);
  }

  pageInfo.textContent = `Sayfa ${pageNum} / ${pdfDoc.numPages}`;
}

function nextPage() {
  if (pageNum < pdfDoc.numPages) {
    pageNum += isLandscape() ? 2 : 1;
    playSound();
    render();
  }
}

function prevPage() {
  if (pageNum > 1) {
    pageNum -= isLandscape() ? 2 : 1;
    if (pageNum < 1) pageNum = 1;
    playSound();
    render();
  }
}

/* Events */
document.getElementById("next").onclick = nextPage;
document.getElementById("prev").onclick = prevPage;

document.getElementById("zoomIn").onclick = () => {
  scale += 0.1;
  render();
};

document.getElementById("zoomOut").onclick = () => {
  scale = Math.max(0.5, scale - 0.1);
  render();
};

document.getElementById("soundToggle").onclick = (e) => {
  soundOn = !soundOn;
  e.target.textContent = soundOn ? "🔊" : "🔇";
};

/* Swipe */
let touchStartX = 0;
viewer.addEventListener("touchstart", e => {
  touchStartX = e.changedTouches[0].screenX;
});

viewer.addEventListener("touchend", e => {
  const diff = e.changedTouches[0].screenX - touchStartX;
  if (Math.abs(diff) > 50) {
    diff < 0 ? nextPage() : prevPage();
  }
});

window.addEventListener("resize", render);

/* Init */
pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
  pdfDoc = pdf;
  render();
});

