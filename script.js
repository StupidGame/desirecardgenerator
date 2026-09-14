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

function saveImage() {
  if (refs.saveBtn.disabled) return;
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.download = "desire-card.png";
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    refs.assetStatus.textContent = "PNGを保存しました";
  }, "image/png");
}

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
