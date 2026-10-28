import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import worker from '../cloudflare-worker-complete.js';
import {PRESETS} from '../assets/sticker-presets.mjs';
const expected=JSON.parse(fs.readFileSync(new URL('./fixtures/photo-head-prompt-hashes.json',import.meta.url),'utf8'));
const env={OPENAI_API_KEY:'test-only-fake-key',STAMP_ACCESS_TOKEN:'test-only-password'};
let calls=[];const original=globalThis.fetch;
globalThis.fetch=async(url,options)=>{assert.equal(url,'https://api.openai.com/v1/images/edits');calls.push(JSON.parse(options.body));return new Response(JSON.stringify({data:[{b64_json:'mock-no-image-generated'}]}),{headers:{'Content-Type':'application/json'}});};
try{
 const health=await (await worker.fetch(new Request('https://test.invalid/health'),env)).json();
 assert.equal(health.presetVersion,expected.version);assert.deepEqual(health.promptSHA256,expected.promptSHA256);
 for(const edition of ['gk','golf','golf-jojo','gk-jojo']){
  assert.equal(crypto.createHash('sha256').update(PRESETS[edition].prompt).digest('hex'),expected.promptSHA256[edition]);assert.equal(PRESETS[edition].items.length,16);
  const photo='data:image/png;base64,AAAA';
  const request=new Request('https://test.invalid/generate',{method:'POST',headers:{'Content-Type':'application/json','X-Stamp-Token':env.STAMP_ACCESS_TOKEN,'Origin':'https://takashimatm-create.github.io'},body:JSON.stringify({index:0,photo,mode:'sticker-sheet-v1',edition,responseFormat:'openai'})});
  const response=await worker.fetch(request,env);assert.equal(response.status,200);const payload=calls.at(-1);
  assert.equal(payload.prompt,PRESETS[edition].prompt);assert.equal(crypto.createHash('sha256').update(payload.prompt).digest('hex'),expected.promptSHA256[edition]);
  assert.equal(payload.model,'gpt-image-2');assert.equal(payload.quality,'high');assert.equal(payload.size,'1536x1024');assert.equal(payload.n,1);assert.equal(payload.background,'opaque');assert.equal(payload.input_fidelity,undefined);assert.equal(payload.mask,undefined);assert.deepEqual(payload.images,[{image_url:photo}]);
  console.log('PASS exact prompt and request: '+edition+' '+expected.promptSHA256[edition]);
 }
 assert.equal(calls.length,4);
 console.log('PASS health hashes, all 64 phrases/scenes, exact user prompts, four mocked OpenAI requests, no live API requests.');
}finally{globalThis.fetch=original;}
