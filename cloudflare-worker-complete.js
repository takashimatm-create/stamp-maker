// GK Stamp Maker. Keep OPENAI_API_KEY and STAMP_ACCESS_TOKEN in Cloudflare Secrets.
const ORIGIN='https://takashimatm-create.github.io';
const EXPRESSION_CANONICAL=[0,1,2,0,4,5,1,7,5,0,10,11,2,7,4,10];
const MAX_BYTES=8*1024*1024;
const EXPRESSIONS=['a warm grateful smile','a polite grateful smile','a gently apologetic expression','an approving smile','an encouraging energetic smile','a determined expression','a kind supportive smile','a quietly confident expression','a focused expression','a confident encouraging smile','a warm reassuring smile','a comically disappointed but natural expression','a polite friendly smile','a hopeful smile','an excited optimistic smile','a thoughtful focused expression'];
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin','Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Stamp-Token, X-Stamp-Remember','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
  if(origin&&origin!==ORIGIN)return json({error:'このサイトからは利用できません。'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const path=new URL(request.url).pathname;
  if(path==='/health'&&request.method==='GET')return json({ok:true,apiKeyConfigured:Boolean(env.OPENAI_API_KEY),photoEditConfigured:Boolean(env.OPENAI_API_KEY&&env.STAMP_ACCESS_TOKEN),authConfigured:Boolean(env.STAMP_ACCESS_TOKEN),personPoseConfigured:Boolean(env.OPENAI_API_KEY&&env.STAMP_ACCESS_TOKEN)});
  if(!['/session','/generate'].includes(path))return json({error:'指定の機能はありません。'},404);
  if(request.method!=='POST')return json({error:'POSTで呼び出してください。'},405);
  if(!env.STAMP_ACCESS_TOKEN)return json({error:'サーバーのアプリパスワードが未設定です。'},503);
  const token=request.headers.get('X-Stamp-Token')||'';
  const encoder=new TextEncoder();
  const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
  if(token.length>512)return json({error:'パスワードを確認してください。'},401);
  const [a,b]=await Promise.all([digest(token),digest(env.STAMP_ACCESS_TOKEN)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  const passwordOK=!!token&&!diff;let sessionExpiry=0,sessionOK=false;
  const sessionMatch=token.match(/^gks1\.(\d{13})\.([a-f0-9]{32})\.([a-f0-9]{64})$/);
  const signingKey=()=>crypto.subtle.importKey('raw',encoder.encode(env.STAMP_ACCESS_TOKEN),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
  if(!passwordOK&&sessionMatch&&Number(sessionMatch[1])>Date.now()&&Number(sessionMatch[1])<=Date.now()+31*86400000){
   const signature=Uint8Array.from(sessionMatch[3].match(/../g),v=>parseInt(v,16));
   sessionOK=await crypto.subtle.verify('HMAC',await signingKey(),signature,encoder.encode(sessionMatch[1]+'.'+sessionMatch[2]));
   if(sessionOK)sessionExpiry=Number(sessionMatch[1]);
  }
  if(!passwordOK&&!sessionOK)return json({error:'ログインが必要です。パスワードを確認してください。'},401);
  if(path==='/session'){
   if(sessionOK)return json({authenticated:true,token,expiresAt:sessionExpiry});
   const expiresAt=Date.now()+(request.headers.get('X-Stamp-Remember')==='1'?30*86400000:12*3600000);
   const nonce=crypto.randomUUID().replaceAll('-','');const payload=expiresAt+'.'+nonce;
   const signature=new Uint8Array(await crypto.subtle.sign('HMAC',await signingKey(),encoder.encode(payload)));
   const hex=Array.from(signature,v=>v.toString(16).padStart(2,'0')).join('');
   return json({authenticated:true,token:'gks1.'+payload+'.'+hex,expiresAt});
  }
  if(!env.OPENAI_API_KEY)return json({error:'OpenAI APIキーが未設定です。'},503);
  if(!(request.headers.get('Content-Type')||'').includes('application/json'))return json({error:'画像をJSON形式で送信してください。'},415);
  try{
   const limit=Math.ceil(MAX_BYTES*4/3)+2048;
   if(Number(request.headers.get('Content-Length'))>limit)return json({error:'写真は8MB以内にしてください。'},413);
   const reader=request.body?.getReader();if(!reader)return json({error:'写真がありません。'},400);
   let total=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>limit){await reader.cancel();return json({error:'写真は8MB以内にしてください。'},413)}chunks.push(value)}
   const bytes=new Uint8Array(total);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length}
   let body;try{body=JSON.parse(new TextDecoder().decode(bytes))}catch{return json({error:'送信データを読み込めません。'},400)}
   if(!Number.isInteger(body.index)||body.index<0||body.index>15)return json({error:'番号は1〜16を選んでください。'},400);
   const canonical=EXPRESSION_CANONICAL[body.index];
   const match=typeof body.photo==='string'&&body.photo.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
   if(!match||match[2].length%4)return json({error:'PNG・JPEG・WebPの写真を選んでください。'},400);
   if(match[2].length>Math.ceil(MAX_BYTES*4/3))return json({error:'写真は8MB以内にしてください。'},413);
   // The Images API accepts data URLs directly. Avoid decoding/copying every image byte in JS.
   const payload={model:'gpt-image-1.5',input_fidelity:'high',quality:'medium',size:'1024x1024',n:1,output_format:'png',images:[{image_url:body.photo}],prompt:'Edit the supplied photograph. Change only the facial expression to '+EXPRESSIONS[canonical]+'. Preserve the exact same person, facial identity, age, hairstyle, skin texture, clothing, pose, camera angle and background. Keep all people and their number unchanged. Keep it photorealistic. Do not illustrate or cartoonize. Do not add text, letters, logos, extra people or objects.'};
   if(canonical===2||canonical===11){
    payload.background='transparent';
    const identity='Use the uploaded photograph as the identity reference for the adult coach. Preserve this exact adult person, their age, distinctive hair color and hairstyle, hairline, head shape and body build. Photorealistic sports sticker subject, black athletic top with red shoulder stripes, black shorts and sports shoes. No letters, words, captions, logos, watermarks, decorative effects or extra panels. Transparent background. Show the whole required pose within the frame. Do not invent or show a front-facing smile or facial expression. ';
    payload.prompt=identity+(canonical===2?'Create a front-view full-body scene of the adult coach standing in the center, bending deeply forward at the waist in a respectful Japanese bow, both hands on thighs or knees. The head is lowered so only the crown and back of the head and hair are visible; the face and eyes are completely hidden. A child in a red sports shirt and black shorts stands on each side, also bowing with faces hidden. Exactly one adult coach and two children.':'Create a scene of the adult coach alone sitting on a low step, knees drawn up, forearms crossed over the knees, forehead resting face-down on the arms. Show the crown and back of the head and characteristic hair; the face and eyes are completely hidden. Include the full seated body and shoes. Exactly one adult, no children or other people.');
   }
   const upstream=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(150000)});
   // New clients consume the original response directly, without parsing/re-encoding megabytes in the Worker.
   if(upstream.ok&&body.responseFormat==='openai')return new Response(upstream.body,{status:200,headers});
   let result;try{result=await upstream.json()}catch{
    console.error(JSON.stringify({event:'image_edit_failed',slot:body.index+1,upstreamStatus:upstream.status,code:'non_json_response'}));
    return json({error:'画像編集APIの応答を読み込めませんでした（'+(body.index+1)+'番・HTTP '+upstream.status+'）。完成済み画像は保持しています。',upstreamStatus:upstream.status,code:'non_json_response'},502);
   }
   if(!upstream.ok){
    const status=upstream.status,rawCode=String(result.error?.code||result.error?.type||'unknown');
    const code=/^[a-z][a-z0-9_]{0,79}$/.test(rawCode)?rawCode:'unknown';
    const rawParam=String(result.error?.param||'');const param=['image','images','background','model','prompt','size','quality','input_fidelity','output_format'].includes(rawParam)?rawParam:'';
    const providerMessage=String(result.error?.message||'');
    const safety=/safety|moderation|policy|content_filter/i.test(code+' '+providerMessage);
    let message;
    if(code==='insufficient_quota'||/quota|credits|balance/i.test(code+' '+providerMessage))message='APIの残高または利用枠が不足しています。';
    else if(status===429)message='画像編集APIの利用頻度制限に達しました。少し待ってから残りだけ再開してください。';
    else if(status===401)message='サーバーのOpenAI APIキーを確認してください。';
    else if(status===403)message='画像編集モデルの利用権限・組織認証を確認してください。';
    else if(safety)message='画像編集APIの安全性判定で写真または生成内容を受け付けられませんでした。';
    else if(status>=500)message='画像編集APIで一時的な障害が発生しました。少し待ってから残りだけ再開してください。';
    else message='画像編集APIが入力または生成条件を受け付けませんでした。';
    console.error(JSON.stringify({event:'image_edit_failed',slot:body.index+1,upstreamStatus:status,code,param,category:safety?'safety':'api_error'}));
    const detail='（'+(body.index+1)+'番・OpenAI HTTP '+status+'・'+code+(param?'・'+param:'')+'）';
    return json({error:message+detail,upstreamStatus:status,code,slot:body.index+1},status===429?429:502);
   }
   const image=result.data?.[0]?.b64_json;if(typeof image!=='string'||!image)return json({error:'編集画像が返りませんでした。'},502);
   return json({image:'data:image/png;base64,'+image});
  }catch(e){return json({error:e.name==='TimeoutError'?'写真編集が時間切れになりました。料金が発生している場合があるため、すぐに再実行せず確認してください。':'写真編集の処理に失敗しました。'},e.name==='TimeoutError'?504:500)}
 }
};