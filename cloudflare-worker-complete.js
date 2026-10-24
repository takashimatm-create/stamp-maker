// GK Stamp Maker. Keep OPENAI_API_KEY and STAMP_ACCESS_TOKEN in Cloudflare Secrets.
const ORIGIN='https://takashimatm-create.github.io';
const EXPRESSION_CANONICAL=[0,1,null,0,4,5,1,7,5,0,10,null,null,7,4,10];
const MAX_BYTES=8*1024*1024;
const EXPRESSIONS=['a warm grateful smile','a polite grateful smile','a gently apologetic expression','an approving smile','an encouraging energetic smile','a determined expression','a kind supportive smile','a quietly confident expression','a focused expression','a confident encouraging smile','a warm reassuring smile','a comically disappointed but natural expression','a polite friendly smile','a hopeful smile','an excited optimistic smile','a thoughtful focused expression'];
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':ORIGIN,'Vary':'Origin','Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Stamp-Token','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
  const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
  if(origin&&origin!==ORIGIN)return json({error:'このサイトからは利用できません。'},403);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  const path=new URL(request.url).pathname;
  if(path==='/health'&&request.method==='GET')return json({ok:true,apiKeyConfigured:Boolean(env.OPENAI_API_KEY),photoEditConfigured:Boolean(env.OPENAI_API_KEY&&env.STAMP_ACCESS_TOKEN),authConfigured:Boolean(env.STAMP_ACCESS_TOKEN)});
  if(!['/session','/generate'].includes(path))return json({error:'指定の機能はありません。'},404);
  if(request.method!=='POST')return json({error:'POSTで呼び出してください。'},405);
  if(!env.STAMP_ACCESS_TOKEN)return json({error:'サーバーのアプリパスワードが未設定です。'},503);
  const token=request.headers.get('X-Stamp-Token')||'';
  // Compare fixed-size digests, including for unequal-length input.
  const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
  if(token.length>512)return json({error:'パスワードを確認してください。'},401);
  const [a,b]=await Promise.all([digest(token),digest(env.STAMP_ACCESS_TOKEN)]);let diff=0;for(let i=0;i<a.length;i++)diff|=a[i]^b[i];
  if(!token||diff)return json({error:'パスワードを確認してください。'},401);
  if(path==='/session')return json({authenticated:true});
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
   const canonical=EXPRESSION_CANONICAL[body.index];if(canonical===null)return json({error:'3・12・13はお辞儀テンプレートをそのまま使うため、表情加工しません。'},400);
   const match=typeof body.photo==='string'&&body.photo.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/]+={0,2})$/);
   if(!match||match[2].length%4)return json({error:'PNG・JPEG・WebPの写真を選んでください。'},400);
   if(match[2].length>Math.ceil(MAX_BYTES*4/3))return json({error:'写真は8MB以内にしてください。'},413);
   // The Images API accepts data URLs directly. Avoid decoding/copying every image byte in JS.
   const payload={model:'gpt-image-1.5',input_fidelity:'high',quality:'medium',size:'1024x1024',n:1,output_format:'png',images:[{image_url:body.photo}],prompt:'Edit the supplied photograph. Change only the facial expression to '+EXPRESSIONS[canonical]+'. Preserve the exact same person, facial identity, age, hairstyle, skin texture, clothing, pose, camera angle and background. Keep all people and their number unchanged. Keep it photorealistic. Do not illustrate or cartoonize. Do not add text, letters, logos, extra people or objects.'};
   const upstream=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(150000)});
   // New clients consume the original response directly, without parsing/re-encoding megabytes in the Worker.
   if(upstream.ok&&body.responseFormat==='openai')return new Response(upstream.body,{status:200,headers});
   const result=await upstream.json();
   if(!upstream.ok){const status=upstream.status;return json({error:status===429?'APIの利用上限または残高を確認してください。':status===401?'サーバーのOpenAI APIキーを確認してください。':status===403?'画像編集モデルの利用権限・組織認証を確認してください。':'写真編集に失敗しました。別の写真で試すか、サーバー設定を確認してください。'},status===429?429:502)}
   const image=result.data?.[0]?.b64_json;if(typeof image!=='string'||!image)return json({error:'編集画像が返りませんでした。'},502);
   return json({image:'data:image/png;base64,'+image});
  }catch(e){return json({error:e.name==='TimeoutError'?'写真編集が時間切れになりました。料金が発生している場合があるため、すぐに再実行せず確認してください。':'写真編集の処理に失敗しました。'},e.name==='TimeoutError'?504:500)}
 }
};