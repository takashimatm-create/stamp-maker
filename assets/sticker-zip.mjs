const imageLimit = 1024 * 1024;
export const stickerNames = Array.from({length: 16}, (_, i) => String(i + 1).padStart(2, '0') + '.png');
const required = [...stickerNames, 'main.png', 'tab.png'];
const decoder = new TextDecoder();
const pngSignature = [137, 80, 78, 71, 13, 10, 26, 10];
const crcTable = Array.from({length: 256}, (_, n) => {
  for (let i = 0; i < 8; i++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function requireZip(ok, message = 'ZIPの構造を確認できません。') {
  if (!ok) throw Error(message);
}
// Accept common timestamp and UID/GID fields. Alternate paths, link targets
// and ZIP64 size overrides are unnecessary for this archive format.
function checkExtraFields(view, start, end) {
  for (let p = start; p < end;) {
    requireZip(p + 4 <= end);
    const type = view.getUint16(p, true), length = view.getUint16(p + 2, true);
    requireZip([0x000a, 0x5455, 0x7875].includes(type), 'ZIPに未対応の追加情報があります。');
    p += 4 + length;
    requireZip(p <= end);
  }
}
async function inflate(bytes, size) {
  if (typeof DecompressionStream !== 'function') throw Error('圧縮ZIPの読み込みには新しいブラウザーを使ってください。');
  const output = new Uint8Array(size);
  const reader = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  let offset = 0;
  try {
    while (true) {
      const {value, done} = await reader.read();
      if (done) break;
      requireZip(offset + value.length <= size, 'ZIPの展開サイズが上限を超えています。');
      output.set(value, offset);
      offset += value.length;
    }
    requireZip(offset === size);
    return output;
  } finally {
    await reader.cancel().catch(() => {});
  }
}
function inspectPng(bytes, name) {
  const fail = () => { throw Error(name + ' のPNG形式またはサイズが正しくありません。'); };
  if (bytes.length < 45 || !pngSignature.every((byte, i) => bytes[i] === byte)) fail();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint32(8) !== 13 || decoder.decode(bytes.subarray(12, 16)) !== 'IHDR') fail();
  const w = view.getUint32(16), h = view.getUint32(20);
  const validSize = name === 'main.png' ? w === 240 && h === 240 :
    name === 'tab.png' ? w === 96 && h === 74 :
    w > 0 && w <= 370 && h > 0 && h <= 320 && w % 2 === 0 && h % 2 === 0;
  if (!validSize) fail();

  let hasPixels = false, ended = false;
  for (let p = 8; p < bytes.length;) {
    if (p + 12 > bytes.length) fail();
    const size = view.getUint32(p), end = p + 12 + size;
    if (end > bytes.length || crc32(bytes.subarray(p + 4, end - 4)) !== view.getUint32(end - 4)) fail();
    const type = decoder.decode(bytes.subarray(p + 4, p + 8));
    if (!/^[A-Za-z]{4}$/.test(type) || (type === 'IHDR' && p !== 8)) fail();
    // Avoid animated PNG and compressed metadata streams passed to image decoders.
    if (['acTL', 'fcTL', 'fdAT', 'iCCP', 'zTXt', 'iTXt'].includes(type)) fail();
    if (type === 'IDAT' && size) hasPixels = true;
    if (type === 'IEND') {
      if (size || end !== bytes.length) fail();
      ended = true;
    }
    p = end;
  }
  if (!hasPixels || !ended) fail();
  return {blob: new Blob([bytes], {type: 'image/png'}), w, h};
}

export async function readStickerZip(file) {
  requireZip(/\.zip$/i.test(file.name), '拡張子が .zip のファイルを選んでください。');
  requireZip(file.size >= 22 && file.size <= 60 * 1024 * 1024, 'ZIPは60MB以内で選んでください。');
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const u16 = p => view.getUint16(p, true);
  const u32 = p => view.getUint32(p, true);
  let end = bytes.length - 22;
  const earliestEnd = Math.max(0, end - 65535);
  while (end >= earliestEnd && (u32(end) !== 0x06054b50 || end + 22 + u16(end + 20) !== bytes.length)) end--;
  requireZip(end >= earliestEnd && u16(end + 4) === 0 && u16(end + 6) === 0);
  requireZip(u16(end + 8) === 18 && u16(end + 10) === 18,
    'ZIPには01.png〜16.png、main.png、tab.pngの18ファイルだけを入れてください。');
  const start = u32(end + 16);
  requireZip(start + u32(end + 12) === end);
  const entries = new Map();
  let p = start;
  for (let i = 0; i < 18; i++) {
    requireZip(p + 46 <= end && u32(p) === 0x02014b50);
    const flags = u16(p + 8), method = u16(p + 10), crc = u32(p + 16);
    const compressed = u32(p + 20), size = u32(p + 24), length = u16(p + 28), local = u32(p + 42);
    const next = p + 46 + length + u16(p + 30) + u16(p + 32);
    requireZip(next <= end && u16(p + 34) === 0 && local + 30 <= start);
    checkExtraFields(view, p + 46 + length, p + 46 + length + u16(p + 30));
    const rawName = bytes.subarray(p + 46, p + 46 + length);
    const name = decoder.decode(rawName);
    requireZip(rawName.every(b => b < 128) && required.includes(name) && !entries.has(name),
      'ファイル名を確認してください。01.png〜16.png、main.png、tab.pngをZIP直下に1つずつ入れてください。');
    const fileType = (u32(p + 38) >>> 16) & 0xf000;
    requireZip((fileType === 0 || fileType === 0x8000) && !(u32(p + 38) & 0x10));
    requireZip((flags & ~0x80e) === 0 && (method === 0 || method === 8),
      '暗号化ZIPや未対応の圧縮形式は読み込めません。');
    requireZip(size > 0 && size <= imageLimit && compressed > 0 && compressed <= imageLimit + 65536,
      name + ' は1MB以内にしてください。');
    requireZip(method !== 0 || compressed === size);
    requireZip(u32(local) === 0x04034b50 && u16(local + 6) === flags &&
      u16(local + 8) === method && u16(local + 26) === length);
    const data = local + 30 + length + u16(local + 28);
    let last = data + compressed;
    requireZip(last <= start && rawName.every((b, j) => b === bytes[local + 30 + j]));
    checkExtraFields(view, local + 30 + length, data);
    if (flags & 8) {
      requireZip((u32(local + 14) === 0 || u32(local + 14) === crc) &&
        (u32(local + 18) === 0 || u32(local + 18) === compressed) &&
        (u32(local + 22) === 0 || u32(local + 22) === size));
      if (last + 4 <= start && u32(last) === 0x08074b50) last += 4;
      requireZip(last + 12 <= start && u32(last) === crc && u32(last + 4) === compressed && u32(last + 8) === size);
      last += 12;
    } else {
      requireZip(u32(local + 14) === crc && u32(local + 18) === compressed && u32(local + 22) === size);
    }
    entries.set(name, {local, data, compressed, last, method, size, crc});
    p = next;
  }
  requireZip(p === end);
  let boundary = 0;
  for (const entry of [...entries.values()].sort((a, b) => a.local - b.local)) {
    requireZip(entry.local === boundary);
    boundary = entry.last;
  }
  requireZip(boundary === start);

  const images = new Map();
  for (const name of required) {
    const {data, compressed, method, size, crc} = entries.get(name);
    const packed = bytes.subarray(data, data + compressed);
    const image = method === 0 ? packed : await inflate(packed, size);
    requireZip(crc32(image) === crc, name + ' が破損しています。');
    images.set(name, inspectPng(image, name));
  }
  return images;
}

export function inferZipMetadata(filename, presets) {
  const stem = filename.normalize('NFC').replace(/(?: \(\d+\))?\.zip$/i, '');
  for (const [edition, preset] of Object.entries(presets)) {
    const suffix = preset.name.normalize('NFC') + '_16枚';
    if (stem === suffix) return {edition, name: ''};
    if (stem.endsWith('_' + suffix)) return {edition, name: stem.slice(0, -suffix.length - 1).trim().slice(0, 60)};
  }
  return {edition: '', name: ''};
}
