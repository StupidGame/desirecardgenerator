const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const canvasFrame = document.querySelector(".canvas-frame");
const canvasLoading = document.getElementById("canvasLoading");

const bgImage = new Image();
const overlayImage = new Image();
bgImage.src = "./desire.png";
overlayImage.src = "./done.png";

const refs = {
  mainText: document.getElementById("mainText"),
  mainTextCount: document.getElementById("mainTextCount"),
  mainFontSize: document.getElementById("mainFontSize"),
  mainMaxWidth: document.getElementById("mainMaxWidth"),
  mainOffsetX: document.getElementById("mainOffsetX"),
  mainOffsetY: document.getElementById("mainOffsetY"),
  nameText: document.getElementById("nameText"),
  nameFontSize: document.getElementById("nameFontSize"),
  nameOffsetX: document.getElementById("nameOffsetX"),
  nameOffsetY: document.getElementById("nameOffsetY"),
  overlayCheckbox: document.getElementById("overlayCheckbox"),
  saveBtn: document.getElementById("saveBtn"),
  resetBtn: document.getElementById("resetBtn"),
  assetStatus: document.getElementById("assetStatus"),
};

const defaults = {
  mainText: "",
  mainFontSize: 80,
  mainMaxWidth: 600,
  mainOffsetX: 0,
  mainOffsetY: 0,
  nameText: "",
  nameFontSize: 48,
  nameOffsetX: 10,
  nameOffsetY: 10,
  overlayCheckbox: false,
};

function getNumber(element, fallback) {
  const value = Number.parseInt(element.value, 10);
  return Number.isFinite(value) ? value : fallback;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function updateCount() {
  refs.mainTextCount.textContent = `${refs.mainText.value.length} / ${refs.mainText.maxLength}`;
}

function setReadyState(isReady, message) {
  canvasFrame.classList.toggle("is-ready", isReady);
  canvasLoading.textContent = message;
  refs.saveBtn.disabled = !isReady;
  refs.assetStatus.textContent = message;
}

function splitJapaneseText(text, maxWidth) {
  const lines = [];
  const paragraphs = text.replace(/\r\n?/g, "\n").split("\n");

  paragraphs.forEach((paragraph) => {
    if (!paragraph) {
      lines.push("");
      return;
    }

    let line = "";
    for (const character of [...paragraph]) {
      const testLine = line + character;
      if (line && ctx.measureText(testLine).width > maxWidth) {
        lines.push(line);
        line = character;
      } else {
        line = testLine;
      }
    }
    lines.push(line);
  });

  return lines.length ? lines : [""];
}

function measureTextBlock(text, maxWidth, fontSize) {
  const lines = splitJapaneseText(text, maxWidth);
  const lineHeight = fontSize * 1.2;
  const textBlockWidth = lines.reduce((width, line) => Math.max(width, ctx.measureText(line).width), 0);

  return { lines, textBlockWidth, textBlockHeight: lines.length * lineHeight, lineHeight };
}

function draw() {
  if (!bgImage.complete || !bgImage.naturalWidth) return;

  canvas.width = bgImage.naturalWidth;
  canvas.height = bgImage.naturalHeight;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bgImage, 0, 0);

  const mainFontSize = clamp(getNumber(refs.mainFontSize, defaults.mainFontSize), 12, 160);
  const mainMaxWidth = clamp(getNumber(refs.mainMaxWidth, defaults.mainMaxWidth), 100, canvas.width);
  const mainOffsetX = getNumber(refs.mainOffsetX, defaults.mainOffsetX);
  const mainOffsetY = getNumber(refs.mainOffsetY, defaults.mainOffsetY);
  const mainText = refs.mainText.value;

  ctx.font = `${mainFontSize}px "KaizouNextUPB", sans-serif`;
  ctx.fillStyle = "#000";
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  const mainMetrics = measureTextBlock(mainText, mainMaxWidth, mainFontSize);
  const mainBox = { x: mainOffsetX, y: mainOffsetY, width: mainMetrics.textBlockWidth, height: mainMetrics.textBlockHeight, lines: mainMetrics.lines, lineHeight: mainMetrics.lineHeight };

  const nameText = refs.nameText.value.trim();
  const nameFontSize = clamp(getNumber(refs.nameFontSize, defaults.nameFontSize), 12, 100);
  const nameOffsetX = getNumber(refs.nameOffsetX, defaults.nameOffsetX);
  const nameOffsetY = getNumber(refs.nameOffsetY, defaults.nameOffsetY);
  let nameBox = null;

  if (nameText) {
    ctx.font = `${nameFontSize}px "KaizouNextUPB", sans-serif`;
    nameBox = { text: nameText, x: mainBox.x + mainBox.width + nameOffsetX, y: mainBox.y + mainBox.height + nameOffsetY, width: ctx.measureText(nameText).width, height: nameFontSize, fontSize: nameFontSize };
  }

  const boxes = [mainBox, nameBox].filter(Boolean);
  const minX = Math.min(...boxes.map((box) => box.x));
  const minY = Math.min(...boxes.map((box) => box.y));
  const maxX = Math.max(...boxes.map((box) => box.x + box.width));
  const maxY = Math.max(...boxes.map((box) => box.y + box.height));
  const centerOffsetX = (canvas.width - (maxX - minX)) / 2 - minX;
  const centerOffsetY = (canvas.height - (maxY - minY)) / 2 - minY;

  ctx.font = `${mainFontSize}px "KaizouNextUPB", sans-serif`;
  let currentY = mainBox.y + centerOffsetY;
  mainBox.lines.forEach((line) => {
    ctx.fillText(line, mainBox.x + centerOffsetX, currentY);
    currentY += mainBox.lineHeight;
  });

  if (nameBox) {
    ctx.font = `${nameBox.fontSize}px "KaizouNextUPB", sans-serif`;
    ctx.fillText(nameBox.text, nameBox.x + centerOffsetX, nameBox.y + centerOffsetY);
  }

  if (refs.overlayCheckbox.checked && overlayImage.complete && overlayImage.naturalWidth) {
    const overlayScale = 0.6;
    const scaledWidth = overlayImage.naturalWidth * overlayScale;
    const scaledHeight = overlayImage.naturalHeight * overlayScale;
    ctx.drawImage(overlayImage, (canvas.width - scaledWidth) / 2, (canvas.height - scaledHeight) / 2, scaledWidth, scaledHeight);
  }
}

function resetForm() {
  Object.entries(defaults).forEach(([key, value]) => {
    if (refs[key].type === "checkbox") refs[key].checked = value;
    else refs[key].value = value;
  });
  updateCount();
  draw();
}

function canvasToPng(sourceCanvas) {
  return new Promise((resolve, reject) => {
    sourceCanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("PNG画像を作成できませんでした"));
    }, "image/png");
  });
}

async function getBackPng() {
  const response = await fetch("./desire-back.png");
  if (!response.ok) throw new Error("裏面画像を読み込めませんでした");
  // The supplied .png file contains JPEG data; export genuine PNG bytes.
  const bitmap = await createImageBitmap(await response.blob());
  try {
    const backCanvas = document.createElement("canvas");
    backCanvas.width = bitmap.width;
    backCanvas.height = bitmap.height;
    backCanvas.getContext("2d").drawImage(bitmap, 0, 0);
    return await canvasToPng(backCanvas);
  } finally {
    bitmap.close();
  }
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

async function saveImage() {
  if (refs.saveBtn.disabled) return;
  refs.saveBtn.disabled = true;
  refs.assetStatus.textContent = "表面と裏面をまとめています…";

  try {
    const [frontImage, backImage] = await Promise.all([canvasToPng(canvas), getBackPng()]);
    const archive = await createImageArchive([
      { name: "desire-card.png", blob: frontImage },
      { name: "desire-back.png", blob: backImage },
    ]);
    downloadBlob(archive, "desire-card-set.zip");
    refs.assetStatus.textContent = "表面＋裏面のZIPのダウンロードを開始しました";
  } catch {
    refs.assetStatus.textContent = "書き出せませんでした。通信状況を確認して、もう一度お試しください。";
  } finally {
    refs.saveBtn.disabled = false;
  }
}

document.getElementById("saveBackLink").addEventListener("click", async (event) => {
  event.preventDefault();
  const link = event.currentTarget;
  if (link.getAttribute("aria-busy") === "true") return;
  const status = document.getElementById("downloadStatus");
  link.setAttribute("aria-busy", "true");
  status.textContent = "裏面のPNGを準備しています…";
  try {
    downloadBlob(await getBackPng(), "desire-back.png");
    status.textContent = "裏面のダウンロードを開始しました";
  } catch {
    status.textContent = "裏面を保存できませんでした。通信状況を確認して、もう一度お試しください。";
  } finally {
    link.removeAttribute("aria-busy");
  }
});

[
  refs.mainText, refs.mainFontSize, refs.mainMaxWidth, refs.mainOffsetX, refs.mainOffsetY,
  refs.nameText, refs.nameFontSize, refs.nameOffsetX, refs.nameOffsetY, refs.overlayCheckbox,
].forEach((element) => {
  element.addEventListener("input", () => { updateCount(); draw(); });
  element.addEventListener("change", draw);
});

document.querySelectorAll("[data-preset]").forEach((button) => {
  button.addEventListener("click", () => {
    refs.mainText.value = button.dataset.preset;
    updateCount();
    draw();
    refs.mainText.focus();
  });
});

refs.resetBtn.addEventListener("click", resetForm);
refs.saveBtn.addEventListener("click", saveImage);

bgImage.addEventListener("load", () => {
  draw();
  setReadyState(true, "準備完了");
});

bgImage.addEventListener("error", () => setReadyState(false, "背景画像を読み込めませんでした"));
overlayImage.addEventListener("load", draw);
overlayImage.addEventListener("error", () => { refs.assetStatus.textContent = "背景画像は読み込み済みです（スタンプは利用できません）"; });

if (document.fonts?.ready) document.fonts.ready.then(draw);

updateCount();
setReadyState(false, "カードを読み込んでいます…");
