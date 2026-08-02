/** Tiny dependency-free ZIP writer (stored entries, no compression) for browser downloads. */
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) { let c = i; for (let k = 0; k < 8; k++) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[i] = c >>> 0; }
  return table;
})();
const crc32 = (data: Uint8Array) => { let crc = 0xffffffff; for (const byte of data) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; };
const u16 = (view: DataView, offset: number, value: number) => view.setUint16(offset, value, true);
const u32 = (view: DataView, offset: number, value: number) => view.setUint32(offset, value, true);

export const downloadZip = (name: string, files: { path: string; code: string }[]) => {
  const encoder = new TextEncoder();
  const entries = files.map((file) => ({ name: encoder.encode(file.path.replace(/^\/+/, '')), body: encoder.encode(file.code), crc: 0 }));
  entries.forEach((entry) => { entry.crc = crc32(entry.body); });
  const localSize = entries.reduce((size, entry) => size + 30 + entry.name.length + entry.body.length, 0);
  const centralSize = entries.reduce((size, entry) => size + 46 + entry.name.length, 0);
  const bytes = new Uint8Array(localSize + centralSize + 22);
  const view = new DataView(bytes.buffer);
  let offset = 0;
  const positions: number[] = [];
  entries.forEach((entry) => {
    positions.push(offset); u32(view, offset, 0x04034b50); u16(view, offset + 4, 20); u16(view, offset + 6, 0x0800); u16(view, offset + 8, 0); u32(view, offset + 14, entry.crc); u32(view, offset + 18, entry.body.length); u32(view, offset + 22, entry.body.length); u16(view, offset + 26, entry.name.length); u16(view, offset + 28, 0);
    bytes.set(entry.name, offset + 30); bytes.set(entry.body, offset + 30 + entry.name.length); offset += 30 + entry.name.length + entry.body.length;
  });
  const centralOffset = offset;
  entries.forEach((entry, index) => {
    u32(view, offset, 0x02014b50); u16(view, offset + 4, 20); u16(view, offset + 6, 20); u16(view, offset + 8, 0x0800); u16(view, offset + 10, 0); u32(view, offset + 16, entry.crc); u32(view, offset + 20, entry.body.length); u32(view, offset + 24, entry.body.length); u16(view, offset + 28, entry.name.length); u16(view, offset + 30, 0); u16(view, offset + 32, 0); u32(view, offset + 38, 0); u32(view, offset + 42, positions[index]); bytes.set(entry.name, offset + 46); offset += 46 + entry.name.length;
  });
  u32(view, offset, 0x06054b50); u16(view, offset + 8, entries.length); u16(view, offset + 10, entries.length); u32(view, offset + 12, centralSize); u32(view, offset + 16, centralOffset); u16(view, offset + 20, 0);
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/zip' }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1500);
};
