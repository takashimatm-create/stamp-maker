// Add this route to the existing Cloudflare Worker fetch handler, before the /generate route.
// It reuses the existing OPENAI_API_KEY and STAMP_ACCESS_TOKEN secrets.
// CORS: include X-Stamp-Token in Access-Control-Allow-Headers.
if (url.pathname === "/transcribe" && request.method === "POST") {
  if (!env.STAMP_ACCESS_TOKEN || request.headers.get("X-Stamp-Token") !== env.STAMP_ACCESS_TOKEN) {
    return new Response(JSON.stringify({error:"音声認識の認証が必要です"}), {status:401, headers});
  }
  if (!env.OPENAI_API_KEY) {
    return new Response(JSON.stringify({error:"OpenAI APIキーが未設定です"}), {status:503, headers});
  }
  try {
    const input = await request.formData();
    const audio = input.get("file");
    if (!(audio instanceof File) || audio.size < 100 || audio.size > 10 * 1024 * 1024) {
      return new Response(JSON.stringify({error:"録音ファイルが不正です（10MB以内）"}), {status:400, headers});
    }
    const form = new FormData();
    form.append("model", "gpt-4o-mini-transcribe");
    form.append("language", "ja");
    form.append("file", audio, audio.name || "voice.m4a");
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method:"POST",
      headers:{"Authorization":`Bearer ${env.OPENAI_API_KEY}`},
      body:form
    });
    const data = await response.json();
    return new Response(JSON.stringify(response.ok ? {text:data.text || ""} : {error:data.error?.message || "音声認識APIでエラーが発生しました"}), {status:response.status, headers});
  } catch (e) {
    return new Response(JSON.stringify({error:"音声認識処理に失敗しました"}), {status:500, headers});
  }
}