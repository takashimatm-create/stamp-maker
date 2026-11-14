// GK Stamp Maker - 3-step UI (1 create / 2 review+save / 3 approval+LINE).
// Reuses the existing presets, splitter, ZIP reader and API; the Worker and prompts are untouched.
import {actionState,manualSheetRects,parseCutPosition} from './sticker-actions.mjs?v=20261101layout2';
import {PRESETS} from './sticker-presets.mjs?v=20261101layout2';
import {safeName,handoffText} from './sticker-handoff.mjs?v=20261101layout2';
import {analyzeSheet,drawTile} from './sticker-split.mjs?v=20261026b';
import {readStickerZip,inferZipMetadata,stickerNames} from './sticker-zip.mjs?v=20261110zip';
import {makeZip} from './sticker-zipwriter.mjs?v=20261114a';

const $=id=>document.getElementById(id);
const API='https://stamp-maker-api.takashima-tm.workers.dev',SESSION='gk-stamp-session-v1',PRESET_VERSION='2026-11-01-layout-v2';
const SHARE_RE=/^https:\/\/takashimatm-create\.github\.io\/stamp-maker\/view\.html#[a-f0-9]{32}$/;

let photo=null,token='',busy=false,reading=false,sharing=false,photoVersion=0;
let displayed=null,splitState=null,previewReady=false,renderEpoch=0,beforeZip=null,cutTimer;

const setStatus=t=>{$('status').textContent=t;};
const canvas=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c;};
const loadImage=src=>new Promise((res,rej)=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>rej(Error('画像を読み込めません。'));im.src=src;});
const name=()=>$('personName').value.trim();
const zipMode=()=>!!displayed?.zipFile;
const validShare=r=>!!r?.share&&typeof r.share.url==='string'&&SHARE_RE.test(r.share.url)&&Number.isFinite(r.share.expiresAt)&&r.share.expiresAt>Date.now();
function dataBlob(data){const bin=atob(data.split(',')[1]);return new Blob([Uint8Array.from(bin,c=>c.charCodeAt(0))],{type:'image/png'});}
function saveBlob(blob,fileName){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=fileName;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000);}

/* ---------- state / enabling ---------- */
function actions(){return actionState({busy:busy||reading,sharing,reading:false,hasResult:!!displayed,previewReady,splitOK:zipMode()||!!splitState?.ok,reviewed:$('reviewed').checked,named:!!displayed?.name?.trim()});}
function generateReason(){
 if(busy||reading||sharing)return '処理中です。';
 if(zipMode())return 'ZIPを確認中です。新しく作るには「ZIPの確認を終了する」を押してください。';
 if(!name())return '本人の名前を入力してください。';
 if(!photo)return '本人の写真を選んでください。';
 if(!token&&!$('password').value.trim())return 'アプリのパスワードを入力してください。';
 return '';
}
function update(){
 const a=actions(),zm=zipMode();
 const reason=generateReason();
 $('generate').disabled=!!reason;$('generate').textContent=busy?'処理中…':'16コマを作る（有料）';
 $('nextHint').textContent=reason&&!busy?reason:'';
 $('loginBox').hidden=!!token;
 for(const id of ['edition','personName','photo','password','loadZipButton','loadSheetButton'])$(id).disabled=busy||sharing;
 for(const b of document.querySelectorAll('[data-edition]'))b.disabled=busy||sharing;
 $('reviewed').disabled=a.reviewDisabled;
 $('saveZip').disabled=zm?a.locked:a.zipDisabled;
 $('saveZip').textContent=zm?'ZIPを再ダウンロード':'ZIPを保存する';
 $('saveSheet').disabled=a.sheetDisabled;$('shareSheet').disabled=a.sheetDisabled;
 $('manualSplit').disabled=a.manualDisabled||zm;$('autoSplit').disabled=a.manualDisabled||zm;
 $('manualDetails').hidden=zm;
 for(const i of document.querySelectorAll('[data-cut]'))i.disabled=a.locked;
 $('zipExitWrap').hidden=!(zm&&beforeZip);
 $('reviewedLabel').textContent=zm?'ZIPの16枚・版・本人名を確認しました':'16枚とも、文字と絵が切れていないことを確認しました';
 $('saveHint').textContent=!displayed?'':!previewReady?(splitState&&!splitState.ok?'自動分割できません。「分割がずれているとき」で位置を補正してください。':'16枚を準備中です…'):!$('reviewed').checked?'上のチェックを入れると保存できます。':'';
 // step 3
 const subject=displayed||{name:name(),edition:$('edition').value};
 const consentOK=$('shareConsent').checked;
 $('createShare').disabled=a.shareDisabled||!consentOK;
 $('createShare').textContent=sharing?'リンクを作成中…':validShare(subject)?'共有リンクを確認済み':'共有リンクを作成する';
 $('shareHint').textContent=!displayed?'':a.shareDisabled?(!$('reviewed').checked?'ステップ2の確認チェックを先に入れてください。':!subject.name?.trim()?'ステップ1で本人の名前を入力してください。':''):!consentOK?'本人の同意チェックを入れてください。':'';
 $('shareURL').value=validShare(subject)?subject.share.url:'';
 const t=handoffText({name:subject.name||'',edition:subject.edition,link:validShare(subject)?subject.share.url:'',creator:$('creatorName')?.value||''});
 for(const [id,key] of [['titleJa','title'],['descriptionJa','description'],['titleEn','englishTitle'],['descriptionEn','englishDescription'],['copyrightText','copyright'],['approvalText','approval']])if($(id))$(id).value=t[key];
 if($('tasteChoice'))$('tasteChoice').textContent='「カッコいい」';
 if($('zipFilenameGuide'))$('zipFilenameGuide').textContent=subject.zipFile?.name||(safeName(subject.name)?safeName(subject.name)+'_':'')+PRESETS[subject.edition].name+'_16枚.zip';
 if($('workURL'))$('workURL').value=validShare(subject)?subject.share.url:'';
 if($('supplementText'))$('supplementText').value=(subject.name||'本人')+'の写真を参照し、AIによる画像生成・加工を行って制作した16個の静止画スタンプです。写真の権利者および被写体本人の使用許諾を確認しています。本人の顔と髪は写真に忠実な表現とし、体・道具・背景'+(subject.edition.startsWith('gk')?'・架空の子ども':'')+'はイラスト表現です。LINE STORE／ショップ非公開で申請します。';
 for(const b of document.querySelectorAll('[data-copy]')){const k=b.dataset.copy;
  b.disabled=sharing||!subject.name?.trim()||(zm&&!$('reviewed').checked)||(['approvalText','workURL'].includes(k)&&!validShare(subject))||(k==='supplementText'&&!$('rightsConfirmed').checked)||(k==='copyrightText'&&!/^[A-Za-z0-9 ._-]{1,46}$/.test($('creatorName').value.trim()));}
 updateNav();
}
function updateNav(){
 const has=!!displayed,saved=!!displayed?.zipSaved||zipMode();
 $('s2').hidden=!has;$('s3').hidden=!has;
 const cur=!has?1:validShare(displayed)||$('shareConsent').checked?3:saved?3:2;
 for(const n of [1,2,3]){const a=$('nav'+n);a.removeAttribute('aria-current');a.classList.toggle('done',n<cur);if(n===cur)a.setAttribute('aria-current','step');}
}
function go(id){const el=$(id);if(el&&!el.hidden)el.scrollIntoView({behavior:'smooth',block:'start'});}

/* ---------- edition ---------- */
function selectEdition(){
 if(!Object.hasOwn(PRESETS,$('edition').value))$('edition').value='gk';
 const ed=$('edition').value,p=PRESETS[ed];
 for(const b of document.querySelectorAll('[data-edition]'))b.setAttribute('aria-pressed',String(b.dataset.edition===ed));
 let s=ed.startsWith('golf')?'顔・髪は写真に忠実な写実表現。胴体は見本に近い自然な体格のイラスト。道具・背景もイラスト調。':'顔・髪は写真に忠実な写実表現。胴体は見本に近い体格のイラスト。子どもは顔も体もイラスト調に固定。黒い服に赤いライン、ロゴなし。';
 if(p.visualStyle==='jojo')s+=' 体・服・道具・背景はジョジョ風の劇画表現。本人の顔・髪は漫画化せず写真に忠実。各コマの左右8%以上・上下10%以上を純白の余白にします。';
 if(ed==='gk-jojo')s+=' 文字は各コマで上・左右・下へ配置を変えます。';
 $('style').textContent=s;
 $('phrases').replaceChildren(...p.items.map(it=>{const li=document.createElement('li');li.textContent=it.text+' ／ '+it.scene;return li;}));
 if(zipMode()){displayed.edition=ed;$('reviewed').checked=false;$('shareConsent').checked=false;$('resultName').textContent=p.name+' ／ ZIPから復元';}
 update();
}

/* ---------- result display / split ---------- */
function checkSplit(im,result=displayed){
 if(result?.manualCuts)return manualSheetRects(im.naturalWidth,im.naturalHeight,result.manualCuts);
 const c=canvas(im.naturalWidth,im.naturalHeight),ctx=c.getContext('2d',{willReadFrequently:true});
 ctx.fillStyle='#fff';ctx.fillRect(0,0,c.width,c.height);ctx.drawImage(im,0,0);
 return analyzeSheet(ctx.getImageData(0,0,c.width,c.height));
}
function showResult(result){
 if(result&&typeof result.name!=='string')result.name=name();
 displayed=result;splitState=null;previewReady=false;renderEpoch++;
 if(result)$('personName').value=result.name||$('personName').value;
 for(const id of ['reviewed','shareConsent','rightsConfirmed'])$(id).checked=false;
 $('manualPanel').hidden=true;$('manualDetails').open=false;clearTimeout(cutTimer);
 $('cards').replaceChildren();$('splitStatus').textContent='白い余白と分割位置を確認中…';
 if(result){
  $('sheet').src=result.sheet;
  $('resultName').textContent=PRESETS[result.edition].name+' ／ '+(result.zipFile?'ZIPから復元':result.width+'×'+result.height+'px');
  if(result.zipFile){$('cards').replaceChildren(...result.cards);$('splitStatus').textContent='スタンプ16枚、メイン画像、タブ画像を確認しました。';previewReady=true;}
  else renderCards(result);
  $('shareSheet').hidden=!(navigator.share&&navigator.canShare);
 }
 update();
}
async function renderCards(result){
 const epoch=++renderEpoch;previewReady=false;splitState=null;update();
 try{
  const im=await loadImage(result.sheet);
  if(displayed!==result||epoch!==renderEpoch)return;
  const an=checkSplit(im,result);splitState=an;
  if(!an.ok){$('cards').replaceChildren();$('splitStatus').textContent='自動分割を停止しました。'+an.reason+'\n一覧画像は保存できます。再生成は不要です。下の「分割がずれているとき」で位置を補正してください。';$('manualDetails').open=true;update();return;}
  const nodes=[];
  for(let i=0;i<16;i++){const box=document.createElement('div');box.className='card';const c=drawTile(im,an.rects[i],canvas(370,320),370,320);const p=document.createElement('p');p.textContent=(i+1)+'. '+PRESETS[result.edition].items[i].text;box.append(c,p);nodes.push(box);}
  $('cards').replaceChildren(...nodes);previewReady=true;
  $('splitStatus').textContent=an.mode==='manual'?'補正した位置で16枚を表示しました。赤い線と下の16枚で、切れていないか確認してください。':'白い余白を検出し、16枚を表示しました。切れていないか目で確認してください。';
  update();
 }catch(e){
  if(displayed===result&&epoch===renderEpoch){previewReady=false;splitState={ok:false,reason:e.message};$('cards').replaceChildren();$('splitStatus').textContent='分割の確認に失敗しました：'+e.message+'\n一覧画像を保存してから、位置の補正で確認してください。';update();}
 }
}

/* manual cuts */
const readCuts=()=>({x:[1,2,3].map(i=>Number($('cutX'+i).value)),y:[1,2,3].map(i=>Number($('cutY'+i).value))});
function setCuts(c){for(const ax of ['x','y'])c[ax].forEach((v,i)=>{const el=$('cut'+ax.toUpperCase()+(i+1));el.value=Number(v).toFixed(1);el.removeAttribute('aria-invalid');});}
const cutsValid=()=>[...document.querySelectorAll('[data-cut]')].every(i=>parseCutPosition(i.value)!==null);
function invalidateCut(){renderEpoch++;$('reviewed').checked=false;previewReady=false;splitState={ok:false,reason:'位置は2.0〜98.0%の範囲で、小数点第1位まで入力してください。'};$('splitStatus').textContent=splitState.reason;update();}
function syncCut(input,commit=false){
 if(busy||sharing)return;clearTimeout(cutTimer);
 const v=parseCutPosition(input.value,{round:commit});
 if(v===null){input.setAttribute('aria-invalid','true');invalidateCut();return;}
 input.removeAttribute('aria-invalid');if(commit)input.value=v.toFixed(1);
 if(!cutsValid()){invalidateCut();return;}
 $('reviewed').checked=false;previewReady=false;renderEpoch++;splitState=null;update();
 cutTimer=setTimeout(applyManual,120);
}
async function drawGuide(result,cuts){
 const im=await loadImage(result.sheet);if(displayed!==result||result.manualCuts!==cuts)return;
 const c=$('splitGuide');c.width=im.naturalWidth;c.height=im.naturalHeight;const ctx=c.getContext('2d');ctx.drawImage(im,0,0);
 ctx.strokeStyle='#ef1745';ctx.lineWidth=Math.max(2,c.width/500);ctx.setLineDash([c.width/100,c.width/180]);
 for(const x of cuts.x){ctx.beginPath();ctx.moveTo(c.width*x/100,0);ctx.lineTo(c.width*x/100,c.height);ctx.stroke();}
 for(const y of cuts.y){ctx.beginPath();ctx.moveTo(0,c.height*y/100);ctx.lineTo(c.width,c.height*y/100);ctx.stroke();}
}
async function applyManual(){
 if(busy||sharing||!displayed)return;if(!cutsValid()){invalidateCut();return;}
 const result=displayed,cuts=readCuts();$('reviewed').checked=false;previewReady=false;
 try{manualSheetRects(result.width,result.height,cuts);result.manualCuts=cuts;await drawGuide(result,cuts);if(displayed!==result||result.manualCuts!==cuts)return;await renderCards(result);}
 catch(e){splitState={ok:false,reason:e.message};$('splitStatus').textContent=e.message;update();}
}
$('manualSplit').onclick=async()=>{if(busy||sharing||!displayed)return;$('manualPanel').hidden=false;setCuts(displayed.manualCuts||{x:[25,50,75],y:[25,50,75]});await applyManual();};
$('autoSplit').onclick=()=>{if(busy||sharing||!displayed)return;delete displayed.manualCuts;$('manualPanel').hidden=true;$('reviewed').checked=false;renderCards(displayed);};
for(const i of document.querySelectorAll('[data-cut]')){i.oninput=()=>syncCut(i);i.onchange=()=>syncCut(i,true);}

/* ---------- photo ---------- */
$('photo').onchange=async e=>{
 const f=e.target.files[0];if(!f)return;const ver=++photoVersion;reading=true;update();$('photoStatus').textContent='写真を読み込み中…';let url;
 try{
  if(f.size>30*1024*1024)throw Error('写真は30MB以内で選んでください。');
  url=URL.createObjectURL(f);const im=await loadImage(url),k=Math.min(1,1800/Math.max(im.naturalWidth,im.naturalHeight)),c=canvas(Math.round(im.naturalWidth*k),Math.round(im.naturalHeight*k));
  c.getContext('2d').drawImage(im,0,0,c.width,c.height);if(ver!==photoVersion)return;
  photo=c.toDataURL('image/jpeg',.94);$('photoPreview').src=photo;$('photoPreview').hidden=false;
  $('photoStatus').textContent='写真を選びました。「16コマを作る」で送信します。';
 }catch(err){photo=null;$('photoPreview').hidden=true;$('photoStatus').textContent=err.message+' JPEG・PNG・WebPで保存し直すと読み込める場合があります。';}
 finally{if(url)URL.revokeObjectURL(url);reading=false;update();}
};

/* ---------- login ---------- */
function forget(){token='';try{localStorage.removeItem(SESSION);}catch{}}
async function sessionRequest(value,remember){
 const r=await fetch(API+'/session',{method:'POST',headers:{'X-Stamp-Token':value,'X-Stamp-Remember':remember?'1':'0'},signal:AbortSignal.timeout(15000)});
 const j=await r.json();if(!r.ok||!j.authenticated||typeof j.token!=='string')throw Error(j.error||'ログインできません。');return j;
}
async function restore(){
 let saved;try{saved=JSON.parse(localStorage.getItem(SESSION)||'null');}catch{}
 if(!saved||typeof saved.token!=='string'||saved.expiresAt<=Date.now()){$('session').textContent='';update();return;}
 try{const j=await sessionRequest(saved.token,true);token=j.token;$('session').textContent='ログイン状態を保持しています。';}
 catch{$('session').textContent='保存したログインを確認できません。パスワードを入力してください。';}
 update();
}
const startup=restore();
async function ensureLogin(){
 await startup;if(token)return;
 const pw=$('password').value.trim();if(!pw)throw Error('アプリのパスワードを入力してください。');
 const remember=$('remember').checked;$('password').value='';
 const j=await sessionRequest(pw,remember);token=j.token;
 try{if(remember)localStorage.setItem(SESSION,JSON.stringify({token:j.token,expiresAt:j.expiresAt}));else localStorage.removeItem(SESSION);}catch{}
 $('session').textContent='ログインしました。';
}
$('logout').onclick=()=>{forget();$('session').textContent='ログアウトしました。';update();};
$('password').oninput=update;

/* ---------- generate (paid) ---------- */
$('generate').onclick=async()=>{
 if(generateReason())return;
 const edition=$('edition').value,source=photo;
 if(!window.confirm(PRESETS[edition].name+'を新しく生成します。API利用料金がかかります。\n保存済み画像の読み込み・分割・保存だけなら、キャンセルしてください。\n生成しますか？')){setStatus('生成をキャンセルしました。画像生成APIは呼び出していません。');return;}
 busy=true;update();setStatus('準備中…');
 try{
  await ensureLogin();
  const health=await fetch(API+'/health',{cache:'no-store',signal:AbortSignal.timeout(15000)});const h=await health.json();
  if(!health.ok||!h.stickerSheetConfigured)throw Error('固定指示版サーバーの更新が必要です。');
  const promptHash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(PRESETS[edition].prompt))),v=>v.toString(16).padStart(2,'0')).join('');
  if(h.presetVersion!==PRESET_VERSION||h.promptSHA256?.[edition]!==promptHash)throw Error('サーバーの固定指示がこの画面と一致しません。再読み込みしてから確認してください。画像生成は開始していません。');
  setStatus(PRESETS[edition].name+'の16コマを生成中です。画面を開いたままお待ちください。\n通信が切れた場合も自動で再生成しません。');
  const r=await fetch(API+'/generate',{method:'POST',headers:{'Content-Type':'application/json','X-Stamp-Token':token},body:JSON.stringify({index:0,photo:source,mode:'sticker-sheet-v1',edition,responseFormat:'openai'}),signal:AbortSignal.timeout(260000)});
  const j=await r.json();
  if(r.status===401)forget();
  if(!r.ok)throw Error(j.error||'生成に失敗しました。');
  const b64=j.data?.[0]?.b64_json;if(typeof b64!=='string'||!b64)throw Error('完成画像が返りませんでした。');
  const sheet='data:image/png;base64,'+b64,im=await loadImage(sheet);
  if(im.naturalWidth*2!==im.naturalHeight*3)throw Error('完成画像の縦横比が3:2ではありません。');
  beforeZip=null;showResult({edition,sheet,width:im.naturalWidth,height:im.naturalHeight,name:name()});
  setStatus('16コマが完成しました。ステップ2で確認して保存してください。');go('s2');
 }catch(e){
  setStatus((e.name==='TimeoutError'||e.name==='TypeError'?'通信が途切れたか時間切れになりました。料金が発生した可能性があるため、すぐに再生成せず確認してください。':e.message)+(displayed?'\n前の完成画像は保持しています。':''));
 }finally{busy=false;update();}
};

/* ---------- resume: sheet image / ZIP ---------- */
$('loadSheetButton').onclick=()=>{if(!busy&&!sharing&&!zipMode())$('loadSheet').click();else if(zipMode())$('zipStatus').textContent='ZIP確認中です。先にステップ2の「ZIPの確認を終了する」を押してください。';};
$('loadSheet').onchange=async e=>{
 const f=e.target.files?.[0];if(!f||busy||sharing||zipMode())return;reading=true;update();let url;
 try{
  if(f.size>30*1024*1024)throw Error('一覧画像は30MB以内にしてください。');
  url=URL.createObjectURL(f);const im=await loadImage(url);
  if(im.naturalWidth<400||im.naturalWidth*2!==im.naturalHeight*3)throw Error('横長3:2の16コマ一覧画像を選んでください。');
  const c=canvas(im.naturalWidth,im.naturalHeight);c.getContext('2d').drawImage(im,0,0);
  showResult({edition:$('edition').value,sheet:c.toDataURL('image/png'),name:name(),width:im.naturalWidth,height:im.naturalHeight});
  $('zipStatus').textContent='一覧画像を読み込みました。画像生成APIは呼び出していません。';go('s2');
 }catch(err){$('zipStatus').textContent=err.message;}
 finally{if(url)URL.revokeObjectURL(url);reading=false;e.target.value='';update();}
};
async function rebuildZipPreview(images){
 const ov=canvas(1800,1200),ctx=ov.getContext('2d'),cards=[];ctx.fillStyle='#fff';ctx.fillRect(0,0,ov.width,ov.height);
 for(const [nm,{blob,w,h}] of images){
  const url=URL.createObjectURL(blob);
  try{
   const im=await loadImage(url);if(im.naturalWidth!==w||im.naturalHeight!==h)throw Error('画像の寸法が一致しません。');
   const i=stickerNames.indexOf(nm);if(i<0)continue;
   const tile=canvas(w,h);tile.getContext('2d').drawImage(im,0,0);
   const k=Math.min(426/w,280/h),dw=w*k,dh=h*k;ctx.drawImage(tile,(i%4)*450+(450-dw)/2,Math.floor(i/4)*300+(300-dh)/2,dw,dh);
   const box=document.createElement('div'),label=document.createElement('p');box.className='card';label.textContent=nm;box.append(tile,label);cards.push(box);
  }catch{throw Error(nm+' のPNG画像を表示できません。');}
  finally{URL.revokeObjectURL(url);}
 }
 return {sheet:ov.toDataURL('image/png'),cards,width:ov.width,height:ov.height};
}
$('loadZipButton').onclick=()=>{if(!busy&&!sharing)$('loadZip').click();};
$('loadZip').onchange=async e=>{
 const f=e.target.files?.[0];if(!f||busy||sharing)return;reading=true;update();$('zipStatus').textContent='ZIPの中身と画像を確認中…';
 try{
  const images=await readStickerZip(f),preview=await rebuildZipPreview(images),inf=inferZipMetadata(f.name,PRESETS);
  if(!beforeZip)beforeZip={edition:$('edition').value,name:$('personName').value};
  const edition=inf.edition||$('edition').value;$('edition').value=edition;
  if(inf.name)$('personName').value=inf.name;
  showResult({...preview,edition,name:inf.name||name(),zipFile:f});selectEdition();
  $('zipStatus').textContent=(inf.edition?'ZIP名から版'+(inf.name?'と本人名':'')+'を設定しました。':'ZIP名から版を特定できませんでした。')+'版と本人名を確認してください。画像生成は行っていません。';
  go('s2');
 }catch(err){$('zipStatus').textContent=err.message+' 前の作業は保持しています。';}
 finally{reading=false;e.target.value='';update();}
};
$('exitZip').onclick=()=>{
 if(!beforeZip||busy||sharing)return;
 $('edition').value=beforeZip.edition;$('personName').value=beforeZip.name;beforeZip=null;
 showResult(null);selectEdition();$('sheet').removeAttribute('src');$('zipStatus').textContent='ZIPの確認を終了しました。';go('s1');
};

/* ---------- save ---------- */
$('saveSheet').onclick=()=>{if(displayed)saveBlob(dataBlob(displayed.sheet),(safeName(displayed.name)?safeName(displayed.name)+'_':'')+PRESETS[displayed.edition].name+'_16コマ.png');};
$('shareSheet').onclick=async()=>{
 if(!displayed)return;
 try{const file=new File([dataBlob(displayed.sheet)],PRESETS[displayed.edition].name+'_16コマ.png',{type:'image/png'});
  if(!navigator.canShare({files:[file]})){setStatus('この端末では共有できません。「一覧画像だけ保存」を使ってください。');return;}
  await navigator.share({files:[file]});}
 catch(e){if(e.name!=='AbortError')setStatus('共有できませんでした。「一覧画像だけ保存」を使ってください。');}
};
async function saveExport(){
 if(actions().zipDisabled)return;
 const result=displayed,reviewedRects=JSON.stringify(splitState.rects);busy=true;update();
 try{
  const im=await loadImage(result.sheet),an=checkSplit(im,result),files=[];
  if(!an.ok){splitState=an;previewReady=false;$('reviewed').checked=false;throw Error('分割を確認できないためZIP保存を停止しました。位置の補正で確認してください。');}
  if(JSON.stringify(an.rects)!==reviewedRects){$('reviewed').checked=false;renderCards(result);throw Error('分割位置が変わったため、16枚をもう一度確認してください。');}
  for(let i=0;i<18;i++){
   const w=i<16?370:i===16?240:96,h=i<16?320:i===16?240:74,c=drawTile(im,an.rects[i<16?i:0],canvas(w,h),w,h);
   const blob=await new Promise(res=>c.toBlob(res,'image/png'));if(!blob)throw Error('PNGを作成できません。');
   files.push({name:i<16?String(i+1).padStart(2,'0')+'.png':i===16?'main.png':'tab.png',bytes:new Uint8Array(await blob.arrayBuffer())});
  }
  saveBlob(makeZip(files),(safeName(result.name)?safeName(result.name)+'_':'')+PRESETS[result.edition].name+'_16枚.zip');
  result.zipSaved=true;setStatus('16枚＋メイン＋タブ画像のZIPを保存しました。ステップ3へ進めます。');
  $('saveHint').textContent='保存しました。ステップ3へ進んでください。';
 }catch(e){setStatus(e.message);$('saveHint').textContent=e.message;}
 finally{busy=false;update();if(displayed?.zipSaved)go('s3');}
}
$('saveZip').onclick=()=>{if(busy||sharing)return;if(zipMode()){saveBlob(displayed.zipFile,displayed.zipFile.name);displayed.zipSaved=true;update();}else saveExport();};
$('reviewed').onchange=update;

/* ---------- step 3: share + copy ---------- */
$('createShare').onclick=async()=>{
 if(actions().shareDisabled||!$('shareConsent').checked)return;
 const result=displayed;if(validShare(result)){$('shareStatus').textContent='作成済みのリンクを文面に入れています。承認依頼文をコピーしてください。';return;}
 sharing=true;update();$('shareStatus').textContent='一覧画像を保存してリンクを作成中…';
 try{
  await startup;if(!token)throw Error('ステップ1でログインしてください（パスワード入力後に「16コマを作る」またはページ再読み込み）。');
  const r=await fetch(API+'/share',{method:'POST',headers:{'Content-Type':'image/png','X-Stamp-Token':token},body:dataBlob(result.sheet),signal:AbortSignal.timeout(60000)});
  const j=await r.json();if(r.status===401)forget();
  if(!r.ok)throw Error(j.error||'リンクを作成できませんでした。');if(!validShare({share:j}))throw Error('共有リンクの形式を確認できません。');
  result.share=j;if(displayed===result)$('shareStatus').textContent='リンクを作成しました。30日間有効です。下の承認依頼文をコピーしてLINEに貼り付けてください。';
 }catch(e){if(displayed===result)$('shareStatus').textContent=e.message;}
 finally{sharing=false;update();}
};
$('shareConsent').onchange=update;
$('personName').oninput=()=>{if(displayed){displayed.name=name();if(zipMode())$('reviewed').checked=false;}$('shareConsent').checked=false;update();};
document.addEventListener('input',e=>{if(e.target.id==='creatorName'||e.target.id==='rightsConfirmed')update();});
document.addEventListener('change',e=>{if(e.target.id==='rightsConfirmed')update();});
for(const b of document.querySelectorAll('[data-copy]'))b.onclick=async()=>{
 const f=$(b.dataset.copy);
 try{if(!navigator.clipboard?.writeText)throw Error();await navigator.clipboard.writeText(f.value);$('copyStatus').textContent='コピーしました。登録画面の入力欄を長押しして貼り付けてください。';}
 catch{f.hidden=false;f.focus();f.select();f.setSelectionRange(0,f.value.length);$('copyStatus').textContent='文字を選択しました。長押ししてコピーしてください。';}
};
for(const b of document.querySelectorAll('[data-edition]'))b.onclick=()=>{if(busy||sharing)return;$('edition').value=b.dataset.edition;selectEdition();};
window.addEventListener('beforeunload',e=>{if(busy||sharing){e.preventDefault();e.returnValue='';}});
selectEdition();
