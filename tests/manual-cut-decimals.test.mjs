import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto as crypto,createHash} from 'node:crypto';
import {PRESETS} from '../assets/sticker-presets.mjs';
import {parseCutPosition,manualSheetRects} from '../assets/sticker-actions.mjs';
import worker from '../cloudflare-worker-complete.js';
const expected=JSON.parse(fs.readFileSync(new URL('./fixtures/photo-head-prompt-hashes.json',import.meta.url),'utf8'));
for(const edition of ['gk','golf'])assert.equal(createHash('sha256').update(PRESETS[edition].prompt).digest('hex'),{gk:'7c9b9852ed0245797b59bfd00577f644d312db7e2cfbe6113f566750bf27d871',golf:'320c2256a9c03df3eefa1682cae8ad5bc8ddd8386abec0121ca6ab266d9fec2e'}[edition]);
for(const edition of ['gk-jojo','golf-jojo']){
 assert.match(PRESETS[edition].prompt,/at least 6%/);assert.match(PRESETS[edition].prompt,/at least 8%/);assert.match(PRESETS[edition].prompt,/every JoJo-style generation/);assert.doesNotMatch(PRESETS[edition].prompt,/Make each head as large as the cell allows/);
}
for(const edition of Object.keys(PRESETS)){assert.equal(PRESETS[edition].items.length,16);assert.match(PRESETS[edition].prompt,/NEVER draw, paint, cartoon/);}
for(const [raw,wanted] of [['25.1',25.1],['50.0',50],['98',98],['2',2],['',null],['abc',null],['99',null],['1.9',null],['25.16',null]])assert.equal(parseCutPosition(raw),wanted);
assert.equal(parseCutPosition('25.16',{round:true}),25.2);assert.equal(parseCutPosition(''),null);assert.equal(parseCutPosition('25.100000000000001'),25.1);
const rects=manualSheetRects(1536,1024,{x:[25.1,50.2,75.3],y:[24.8,49.6,74.9]}).rects;assert.equal(rects.length,16);assert.equal(rects.reduce((s,r)=>s+r.w*r.h,0),1536*1024);
const html=fs.readFileSync(new URL('../ai-test.html',import.meta.url),'utf8'),app=fs.readFileSync(new URL('../assets/sticker-app.mjs',import.meta.url),'utf8');
assert.equal([...html.matchAll(/data-cut-number/g)].length,6);assert.equal([...html.matchAll(/type="number"[^>]*step="0.1"/g)].length,6);
const ids={};for(const match of html.matchAll(/id="([^"]+)"/g))ids[match[1]]={value:'',textContent:'',checked:false,disabled:false,removeAttribute(name){delete this[name];},setAttribute(name,v){this[name]=v;}};
const sliders=[],numbers=[];for(const axis of ['X','Y'])for(let i=1;i<=3;i++){const id='cut'+axis+i;Object.assign(ids[id],{type:'range',value:String(i*25),dataset:{cutFor:id}});Object.assign(ids[id+'Number'],{type:'number',value:(i*25).toFixed(1),dataset:{cutFor:id}});sliders.push(ids[id]);numbers.push(ids[id+'Number']);}
let renders=0,pending=[];
const sandbox=vm.createContext({parseCutPosition,document:{getElementById:id=>ids[id],querySelectorAll:selector=>selector==='[data-cut-number]'?numbers:[]},setTimeout:fn=>{pending.push(fn);return pending.length;},clearTimeout:()=>{pending=[];},Number,console});
vm.runInContext("const $=id=>document.getElementById(id);let busy=false,sharing=false,displayed={},renderEpoch=0,previewReady=true,splitState={ok:true};function update(){ $('saveZip').disabled=!previewReady||!$('reviewed').checked;}function applyManualSplit(){globalThis.manualRuns=(globalThis.manualRuns||0)+1;}",sandbox);
const begin=app.indexOf('function setCuts('),end=app.indexOf('\nasync function drawSplitGuide',begin);assert.ok(begin>=0&&end>begin);vm.runInContext(app.slice(begin,end),sandbox);
vm.runInContext("setCuts({x:[25,50,75],y:[25,50,75]})",sandbox);
ids.reviewed.checked=true;ids.cutX1Number.value='25.1';vm.runInContext('syncCutInput($(\'cutX1Number\'))',sandbox);assert.equal(ids.cutX1.value,'25.1');assert.equal(ids.cutX1Value.textContent,'25.1%');assert.equal(ids.reviewed.checked,false);assert.equal(ids.saveZip.disabled,true);for(const fn of pending.splice(0))fn();assert.equal(sandbox.manualRuns,1);
ids.cutX1.value='24.7';vm.runInContext('syncCutInput($(\'cutX1\'))',sandbox);assert.equal(ids.cutX1Number.value,'24.7');
ids.cutX1Number.value='';vm.runInContext('syncCutInput($(\'cutX1Number\'))',sandbox);assert.equal(pending.length,0);assert.equal(ids.saveZip.disabled,true);assert.equal(ids.cutX1Number['aria-invalid'],'true');
ids.cutX1.value='25.2';vm.runInContext('syncCutInput($(\'cutX1\'))',sandbox);assert.equal(ids.cutX1Number.value,'25.2');assert.equal(ids.cutX1Number['aria-invalid'],undefined);
ids.cutY2Number.value='49.66';vm.runInContext('syncCutInput($(\'cutY2Number\'),true)',sandbox);assert.equal(ids.cutY2Number.value,'49.7');assert.equal(ids.cutY2.value,'49.7');
const env={OPENAI_API_KEY:'test-only-fake-key',STAMP_ACCESS_TOKEN:'test-only-password'};const health=await(await worker.fetch(new Request('https://test.invalid/health'),env)).json();assert.deepEqual(health.promptSHA256,expected.promptSHA256);assert.equal(health.presetVersion,expected.version);
const actualFetch=globalThis.fetch;let mocked=0;
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/images/edits');const payload=JSON.parse(options.body);assert.ok(Object.values(PRESETS).some(p=>p.prompt===payload.prompt));assert.equal(payload.model,'gpt-image-2');assert.equal(payload.input_fidelity,undefined);mocked++;return new Response(JSON.stringify({data:[{b64_json:'mock-only'}]}));};
try{for(const edition of Object.keys(PRESETS)){const request=new Request('https://test.invalid/generate',{method:'POST',headers:{'Content-Type':'application/json','X-Stamp-Token':env.STAMP_ACCESS_TOKEN},body:JSON.stringify({index:0,mode:'sticker-sheet-v1',edition,photo:'data:image/png;base64,AAAA',responseFormat:'openai'})});assert.equal((await worker.fetch(request,env)).status,200);}}finally{globalThis.fetch=actualFetch;}
assert.equal(mocked,4);
console.log('PASS: fixed JoJo margins, original regular prompts and all scenes unchanged, six decimal input pairs, two-way sync, invalid/empty input safety, review reset, preview update, and four mocked Worker requests. No image-generation API called.');
