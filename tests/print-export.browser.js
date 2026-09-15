// Run in the local page with agent-browser eval --stdin (see README).
(async () => {
  const checks = [];
  function check(condition, name, details) {
    if (!condition) throw new Error(`${name}: ${JSON.stringify(details)}`);
    checks.push({ name, details });
  }

  await document.fonts.ready;
  draw();
  for (const [name, blob] of [["front", await canvasToPng(canvas)], ["back", await getBackPng()]]) {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const header = new DataView(bytes.buffer);
    const bitmap = await createImageBitmap(blob);
    const output = document.createElement("canvas");
    output.width = bitmap.width;
    output.height = bitmap.height;
    const context = output.getContext("2d", { willReadFrequently: true });
    context.drawImage(bitmap, 0, 0);
    const pixels = context.getImageData(0, 0, output.width, output.height).data;
    let opaque = true;
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] !== 255) { opaque = false; break; }
    const pixel = (x, y) => Array.from(context.getImageData(x, y, 1, 1).data);
    check(header.getUint32(16) === 2072 && header.getUint32(20) === 1328, `${name}: dimensions`, [bitmap.width, bitmap.height]);
    check(bytes[0] === 137 && bytes[25] === 2 && opaque, `${name}: opaque RGB PNG`);
    check(blob.size <= 4_000_000, `${name}: under 4MB`, blob.size);
    const edges = { top: pixel(1036, 0), bottom: pixel(1036, 1327), left: pixel(0, 664), right: pixel(2071, 664) };
    // Front has intentional white artwork at left/bottom; top/right must be black.
    // The back's gold frame must reach all four edges, with no pale outer strip.
    check(name === "front"
      ? edges.top.slice(0, 3).every((v) => v < 30) && edges.right.slice(0, 3).every((v) => v < 30)
      : Object.values(edges).every((p) => p[2] < 180), `${name}: no outer white bands`, edges);
    bitmap.close();
  }

  const wasStamped = refs.overlayCheckbox.checked;
  try {
    refs.overlayCheckbox.checked = false;
    draw();
    const plain = canvas.toDataURL();
    refs.overlayCheckbox.checked = true;
    draw();
    check(plain !== canvas.toDataURL(), "DONE changes front pixels");
    refs.overlayCheckbox.checked = false;
    draw();
    check(plain === canvas.toDataURL(), "DONE removal restores image");
  } finally {
    refs.overlayCheckbox.checked = wasStamped;
    draw();
  }
  const downloadHeading = document.querySelector(".download-card h3").textContent;
  check(document.querySelectorAll(".download-card").length === 1 && downloadHeading.includes(String.fromCodePoint(35023)), "download list: back only");
  check(!!document.querySelector('a[href="https://x.com/Henshin_Zukan"]'), "special thanks hyperlink");
  check(canvas.getContext("2d").getContextAttributes().colorSpace === "srgb", "sRGB export");
  let rejected = false;
  try {
    await canvasToPng({ toBlob: (callback) => callback(new Blob([new Uint8Array(4_000_001)])) });
  } catch (error) { rejected = error instanceof ImageSizeError; }
  check(rejected, "oversized PNG blocked");

  const originalFetch = window.fetch;
  const originalStatus = refs.assetStatus.textContent;
  try {
    window.fetch = async () => new Response(null, { status: 503 });
    await saveImage();
    check(!refs.saveBtn.disabled && refs.assetStatus.textContent && refs.assetStatus.textContent !== originalStatus, "failed back fetch: error shown and save re-enabled");
  } finally {
    window.fetch = originalFetch;
    refs.assetStatus.textContent = originalStatus;
  }
  return { passed: checks.length, checks };
})()
