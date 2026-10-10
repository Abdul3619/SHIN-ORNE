/**
 * Removes a plain studio background from a photo in the browser and returns a transparent PNG.
 *
 * Stone photos are shot on a plain white, grey or black backdrop, so the background is found by
 * flood-filling inwards from the photo's border: every pixel that is connected to the edge and
 * close in colour to the backdrop becomes transparent. Anything inside the stone stays, even bright
 * white highlights, because those are not connected to the edge. The mask is then eroded by a pixel
 * (kills the light halo) and feathered so the edge is soft instead of jagged.
 *
 * It needs the image host to allow cross-origin pixel reads (Unsplash does). If the image cannot be
 * read for any reason this resolves to null and the caller shows the plain photo instead.
 */
const cache = new Map<string, Promise<string | null>>();

export interface CutoutOptions {
  /** How far (in RGB distance) a pixel may be from the backdrop and still count as backdrop. */
  tolerance?: number;
  /** Longest side of the working canvas; larger is sharper but slower. */
  size?: number;
  /** Extra transparent margin around the stone, as a fraction of its size. */
  pad?: number;
}

function load(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image failed to load'));
    img.src = src;
  });
}

function process(img: HTMLImageElement, { tolerance = 46, size = 720, pad = 0.06 }: CutoutOptions): string | null {
  const scale = Math.min(1, size / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.max(2, Math.round(img.naturalWidth * scale));
  const h = Math.max(2, Math.round(img.naturalHeight * scale));
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(img, 0, 0, w, h);
  let data: ImageData;
  try {
    data = ctx.getImageData(0, 0, w, h);
  } catch {
    return null; // tainted canvas: the host did not allow pixel access
  }
  const px = data.data;

  // Backdrop colour = average of a thin strip around the border.
  let r = 0, g = 0, b = 0, n = 0;
  const strip = Math.max(2, Math.round(Math.min(w, h) * 0.012));
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < strip || y < strip || x >= w - strip || y >= h - strip) {
        const i = (y * w + x) * 4;
        r += px[i]; g += px[i + 1]; b += px[i + 2]; n++;
      }
    }
  }
  r /= n; g /= n; b /= n;
  const tol2 = tolerance * tolerance;
  const bgLum = 0.299 * r + 0.587 * g + 0.114 * b;
  const lightBg = bgLum > 150;
  const isBg = (i: number) => {
    const pr = px[i], pg = px[i + 1], pb = px[i + 2];
    const dr = pr - r, dg = pg - g, db = pb - b;
    if (dr * dr + dg * dg + db * db <= tol2) return true;
    // Soft cast shadows are grey: also treat neutral pixels that are close in brightness as backdrop
    // (only a coloured stone survives this; a colourless one is handled by the tighter dark-backdrop rule).
    const max = Math.max(pr, pg, pb), min = Math.min(pr, pg, pb);
    if (max - min < 20) {
      const lum = 0.299 * pr + 0.587 * pg + 0.114 * pb;
      return lightBg ? lum > bgLum - 110 : lum < bgLum + 38;
    }
    return false;
  };

  // Flood fill from every border pixel that looks like backdrop.
  const bg = new Uint8Array(w * h);
  const stack: number[] = [];
  const push = (x: number, y: number) => {
    const p = y * w + x;
    if (!bg[p] && isBg(p * 4)) { bg[p] = 1; stack.push(p); }
  };
  for (let x = 0; x < w; x++) { push(x, 0); push(x, h - 1); }
  for (let y = 0; y < h; y++) { push(0, y); push(w - 1, y); }
  while (stack.length) {
    const p = stack.pop()!;
    const x = p % w, y = (p / w) | 0;
    if (x > 0) push(x - 1, y);
    if (x < w - 1) push(x + 1, y);
    if (y > 0) push(x, y - 1);
    if (y < h - 1) push(x, y + 1);
  }

  // Foreground mask (1 = keep). Refuse a result that removed nearly nothing or nearly everything.
  let fg = 0;
  const mask = new Float32Array(w * h);
  for (let p = 0; p < w * h; p++) { mask[p] = bg[p] ? 0 : 1; fg += mask[p]; }
  const share = fg / (w * h);
  if (share < 0.02 || share > 0.97) return null;

  // Erode one pixel, then feather with a small box blur.
  const eroded = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      let m = mask[p];
      if (m && (x === 0 || y === 0 || x === w - 1 || y === h - 1 || !mask[p - 1] || !mask[p + 1] || !mask[p - w] || !mask[p + w])) m = 0;
      eroded[p] = m;
    }
  }
  const soft = new Float32Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let s = 0, c = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= h) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= w) continue;
          s += eroded[yy * w + xx]; c++;
        }
      }
      soft[y * w + x] = s / c;
    }
  }

  // Apply alpha and find the bounding box of what is left.
  let minX = w, minY = h, maxX = 0, maxY = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const a = soft[p];
      px[p * 4 + 3] = Math.round(a * 255);
      if (a > 0.05) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX <= minX || maxY <= minY) return null;
  ctx.putImageData(data, 0, 0);

  const bw = maxX - minX + 1, bh = maxY - minY + 1;
  const margin = Math.round(Math.max(bw, bh) * pad);
  const out = document.createElement('canvas');
  out.width = bw + margin * 2;
  out.height = bh + margin * 2;
  out.getContext('2d')!.drawImage(canvas, minX, minY, bw, bh, margin, margin, bw, bh);
  return out.toDataURL('image/png');
}

export function cutout(src: string, options: CutoutOptions = {}): Promise<string | null> {
  const key = `${src}|${options.tolerance ?? ''}|${options.size ?? ''}`;
  let hit = cache.get(key);
  if (!hit) {
    hit = load(src)
      .then((img) => process(img, options))
      .catch(() => null);
    cache.set(key, hit);
  }
  return hit;
}
