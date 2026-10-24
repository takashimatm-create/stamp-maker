// GK Stamp Maker Cloudflare Worker — replace existing Worker source with this file.
// Secrets in Cloudflare: OPENAI_API_KEY and STAMP_ACCESS_TOKEN.
export default {
 async fetch(request,env){
  const url=new URL(request.url);
  const origin=request.headers.get('Origin')||'';
  const allowed=origin==='https://takashimatm-create.github.io';
  const headers={'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':allowed?origin:'https://takashimatm-create.github.io','Vary':'Origin','Access-Control-Allow-Methods':'POST, GET, OPTIONS','Access-Control-Allow-Headers':'Content-Type, X-Stamp-Token','Cache-Control':'no-store'};
  const json=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers});
  if(url.pathname==='/health')return json({ok:true,apiKeyConfigured:Boolean(env.OPENAI_API_KEY),voiceConfigured:Boolean(env.STAMP_ACCESS_TOKEN)});
  if(url.pathname==='/transcribe'&&request.method==='POST'){
   if(!env.STAMP_ACCESS_TOKEN||request.headers.get('X-Stamp-Token')!==env.STAMP_ACCESS_TOKEN)return json({error:'認証が必要です。パスワードを確認してください。'},401);
   if(!env.OPENAI_API_KEY)return json({error:'OpenAI APIキーが未設定です'},503);
   try{
    const body=await request.formData();const audio=body.get('file');
    if(!(audio instanceof File)||audio.size<100||audio.size>10*1024*1024)return json({error:'録音ファイルが不正です（10MB以内）'},400);
    const form=new FormData();form.append('model','gpt-4o-mini-transcribe');form.append('language','ja');form.append('file',audio,audio.name||'voice.m4a');
    const upstream=await fetch('https://api.openai.com/v1/audio/transcriptions',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY},body:form});
    const result=await upstream.json();return json(upstream.ok?{text:result.text||''}:{error:result.error?.message||'音声認識に失敗しました'},upstream.status);
   }catch(e){return json({error:'音声認識の処理に失敗しました'},500)}
  }
  if(url.pathname==='/generate'&&request.method==='POST')return json({error:'写真の表情編集は準備中です。元写真をイラスト化する旧処理は停止しました。'},503);
  return json({message:'GK Stamp Maker API is running'});
 }
};