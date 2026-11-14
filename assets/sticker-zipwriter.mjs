// Minimal STORE-only ZIP writer (UTF-8 names). Same format the previous app produced.
const crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
export function makeZip(files){
 const chunks=[],central=[];let offset=0;
 for(const f of files){
  const name=new TextEncoder().encode(f.name),b=f.bytes;let crc=0xffffffff;
  for(const v of b)crc=crcTable[(crc^v)&255]^(crc>>>8);
  crc=(crc^0xffffffff)>>>0;
  const lh=new Uint8Array(30+name.length),d=new DataView(lh.buffer);
  d.setUint32(0,0x04034b50,true);d.setUint16(4,20,true);d.setUint16(6,0x800,true);d.setUint32(14,crc,true);d.setUint32(18,b.length,true);d.setUint32(22,b.length,true);d.setUint16(26,name.length,true);lh.set(name,30);
  chunks.push(lh,b);
  const ch=new Uint8Array(46+name.length),e=new DataView(ch.buffer);
  e.setUint32(0,0x02014b50,true);e.setUint16(4,20,true);e.setUint16(6,20,true);e.setUint16(8,0x800,true);e.setUint32(16,crc,true);e.setUint32(20,b.length,true);e.setUint32(24,b.length,true);e.setUint16(28,name.length,true);e.setUint32(42,offset,true);ch.set(name,46);
  central.push(ch);offset+=lh.length+b.length;
 }
 const start=offset;chunks.push(...central);for(const ch of central)offset+=ch.length;
 const end=new Uint8Array(22),d=new DataView(end.buffer);
 d.setUint32(0,0x06054b50,true);d.setUint16(8,files.length,true);d.setUint16(10,files.length,true);d.setUint32(12,offset-start,true);d.setUint32(16,start,true);
 chunks.push(end);
 return new Blob(chunks,{type:'application/zip'});
}
