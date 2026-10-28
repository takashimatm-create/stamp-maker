import assert from 'node:assert/strict';
import fs from 'node:fs';
import {cropRect,drawPortrait,composeFreeSheet} from '../assets/sticker-free.mjs';
import {PRESETS} from '../assets/sticker-presets.mjs';
const photo={naturalWidth:900,naturalHeight:1200};
let sourceDraws=0;
function makeCanvas(width,height){const ctx={save(){},restore(){},clearRect(){},fillRect(){},beginPath(){},rect(){},ellipse(){},clip(){},stroke(){},fill(){},moveTo(){},lineTo(){},strokeText(){},fillText(){},measureText(t){return {width:t.length*parseInt(this.font?.match(/\d+px/)?.[0]||'28')*.95};},drawImage(source,...args){if(source===photo){sourceDraws++;assert.equal(args.length,8);assert.ok(args.every(Number.isFinite));}}};return {width,height,getContext:()=>ctx};}
for(const settings of [{x:0,y:0,size:15},{x:100,y:100,size:100},{x:50,y:42,size:58}]){const r=cropRect(900,1200,settings);assert.ok(r.x>=0&&r.y>=0&&r.x+r.w<=900&&r.y+r.h<=1200);}
for(const [edition,preset] of Object.entries(PRESETS)){sourceDraws=0;const result=composeFreeSheet(photo,{x:50,y:42,size:58},preset,edition,makeCanvas);assert.equal(result.width,1536);assert.equal(result.height,1024);assert.equal(sourceDraws,16);}
const app=fs.readFileSync(new URL('../assets/sticker-app.mjs',import.meta.url),'utf8');assert.doesNotMatch(app,/\bfetch\s*\(/);assert.doesNotMatch(app,/\/generate/);assert.match(app,/info.settings.aiUsed=false/);assert.match(app,/composeFreeSheet/);
console.log('PASS: source photo used directly in all 64 tiles, crop boundaries, four editions, no network/generation call in app, free registration metadata.');
