import assert from 'node:assert/strict';
import fs from 'node:fs';
const app=fs.readFileSync(new URL('../assets/sticker-app.mjs',import.meta.url),'utf8'),html=fs.readFileSync(new URL('../ai-test.html',import.meta.url),'utf8');
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(match=>match[1]));
for(const match of app.matchAll(/\$\('([^']+)'\)/g))assert.ok(ids.has(match[1]),'Missing DOM element: '+match[1]);
assert.doesNotMatch(html,/id="(?:saveRegistration|shareRegistration)"/);assert.doesNotMatch(app,/registrationFile|registrationKey|saveRegistration|shareRegistration/);
assert.match(app,/mode:'sticker-sheet-v1'/);assert.match(app,/2026-10-28-photo-head-collage-v1/);assert.match(app,/promptSHA256/);
console.log('PASS: all referenced DOM elements exist; removed application package buttons have no stale handlers; paid-generation request and prompt validation preserved.');
