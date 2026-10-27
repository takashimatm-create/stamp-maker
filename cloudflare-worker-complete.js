// GK Stamp Maker. Keep OPENAI_API_KEY and STAMP_ACCESS_TOKEN in Cloudflare Secrets.
const FIXED_PRESETS={"golf":{"name":"ゴルフ版","items":[{"text":"おはようございます！","scene":"片手を上げてあいさつ。横にキャディバッグ。晴れたゴルフ場と太陽。"},{"text":"流石だね！","scene":"白いポロシャツでサムズアップ。キリッとした表情。"},{"text":"いい読みだ","scene":"グリーン上でしゃがんでラインを読む。パターとボール、奥に旗。"},{"text":"無理せず、できることをやろう！","scene":"サンバイザー姿で水筒の水を飲む。ゴルフ場。"},{"text":"行ってきます！","scene":"黄色いポロシャツでバッグを肩に掛け、ガッツポーズ。笑顔。"},{"text":"やっとバンカーから脱出！","scene":"バンカーショットの瞬間。砂が大きく舞う。"},{"text":"やったぜ！","scene":"青いポロシャツでガッツポーズ。満面の笑み。"},{"text":"確認します！","scene":"ノートパソコンの画面を真剣に見る。"},{"text":"ダボちんスキー","scene":"頭を抱えて落ち込む。倒れたドライバーとボール。頭上にもやもや。"},{"text":"神様ありがとう！","scene":"緑のポロシャツで空を見上げて指さす。キラキラ。"},{"text":"すみません！修行が足りない…練習してきます","scene":"キャディバッグを担いだ後ろ姿で練習場へ向かう。「練習場」の看板。"},{"text":"OK！その調子！","scene":"白いポロシャツでサムズアップ。勢いの線。"},{"text":"今から帰るよー","scene":"キャディバッグを担いだ後ろ姿で手を振る。奥にゴルフカート。"},{"text":"ありがとうございます！","scene":"両手を合わせて感謝。ハート。スコアカード。"},{"text":"スコアは忘れてとりあえず飲もう！","scene":"ビールジョッキを持ってサムズアップ。枝豆とおつまみ。"},{"text":"おやすみ！","scene":"布団で気持ちよく寝ている。夢の吹き出しにゴルフ場と「バーディー！」の文字。Zzz。"}],"prompt":"最優先：写真を忠実に再現して！ Face and hair must be photorealistic, faithfully matching the supplied photograph, NOT illustrated, cartooned, painted, beautified, de-aged or stylized. Preserve actual facial geometry, age, hair and skin texture. Stylize ONLY bodies, clothes, hands, children, props and backgrounds.\n添付写真を本人の参照画像として、以下の条件を厳守したLINEスタンプ一覧画像を1枚作ってください。\n\n\n- 横長3:2の画像1枚に4列×4行の16コマ。左上から右へ、上段から順番。\n- 真っ白な背景。枠線・罫線なし。コマ間に十分な白い余白を設け、絵・文字・効果を各コマ内に完全に収める。\n- 最優先の固定指示：「写真を忠実に再現して！」。その回に添付された本人の顔写真を忠実に再現する。顔・髪は写真同等の写実表現にし、イラスト化・似顔絵化・アニメ化・水彩化・デフォルメをしない。顔立ち、目鼻口の形と位置、顔の輪郭、髪型、髪色、肌の質感、年齢感を変えず、美化・若返り・別人化をしない。表情だけは各場面に合わせて自然に変える。首から下の体・腕・手・服と、子ども・道具・背景のみ指定のイラスト調にする。顔の写実感を保ったまま、首の境目・光・色を自然になじませる。「自然になじませる」ために顔までイラスト化してはいけない。\n- 指定文言を一字一句そのまま使用。誤字・脱字・言い換え禁止。太く読みやすい手書き風文字に白フチ。\n- ブランド・企業ロゴ、実在商品名、マークは描かない。服や道具は無地。参照写真に写るロゴも引き継がない。以前のGKロゴ追加指定はこの標準には適用しない。\n\n\n\n\n\n胴体の画風は、ユーザー添付「ゴルフ版フォーマット.png」に近い自然な体のバランス・ポーズ・服のしわ・立体感を持つ、鮮明で丁寧なカラーイラストに固定する。首から下（体・服・腕・手）、道具、背景のみイラスト。極端なミニキャラ化・幼児化・平面的な簡略化・強すぎるアニメ表現を避ける。写真の本人の顔・髪の写実表現を維持し、胴体の画風を顔に適用しない。参考見本の人物の顔やロゴはコピーしない。服は無地のゴルフ用ポロシャツで白・紺・青・黄・緑などコマごとに変更可。ゴルフ場・練習場の背景は必要なコマのみ。以下の文言・場面は見本画像内の文言に置き換えず、そのまま使う。\n\n1. 「おはようございます！」／片手を上げてあいさつ。横にキャディバッグ。晴れたゴルフ場と太陽。\n2. 「流石だね！」／白いポロシャツでサムズアップ。キリッとした表情。\n3. 「いい読みだ」／グリーン上でしゃがんでラインを読む。パターとボール、奥に旗。\n4. 「無理せず、できることをやろう！」／サンバイザー姿で水筒の水を飲む。ゴルフ場。\n5. 「行ってきます！」／黄色いポロシャツでバッグを肩に掛け、ガッツポーズ。笑顔。\n6. 「やっとバンカーから脱出！」／バンカーショットの瞬間。砂が大きく舞う。\n7. 「やったぜ！」／青いポロシャツでガッツポーズ。満面の笑み。\n8. 「確認します！」／ノートパソコンの画面を真剣に見る。\n9. 「ダボちんスキー」／頭を抱えて落ち込む。倒れたドライバーとボール。頭上にもやもや。\n10. 「神様ありがとう！」／緑のポロシャツで空を見上げて指さす。キラキラ。\n11. 「すみません！修行が足りない…練習してきます」／キャディバッグを担いだ後ろ姿で練習場へ向かう。「練習場」の看板。\n12. 「OK！その調子！」／白いポロシャツでサムズアップ。勢いの線。\n13. 「今から帰るよー」／キャディバッグを担いだ後ろ姿で手を振る。奥にゴルフカート。\n14. 「ありがとうございます！」／両手を合わせて感謝。ハート。スコアカード。\n15. 「スコアは忘れてとりあえず飲もう！」／ビールジョッキを持ってサムズアップ。枝豆とおつまみ。\n16. 「おやすみ！」／布団で気持ちよく寝ている。夢の吹き出しにゴルフ場と「バーディー！」の文字。Zzz。\n\n\n構図は均等な4列×4行です。全コマ内の文字と絵を端から離し、コマ間に十分な完全な白い余白を設けてください。写真の背景・商品・ロゴは使わず、本人の顔立ちと髪型・髪色・年齢感・肌の質感を忠実に再現してください。写真に忠実な写実的な顔と髪を、イラストの体へ光・色・首の境目を整えて自然につなげてください。自然につなぐために顔や髪をイラスト化してはいけません。指定された文言以外の余計な文字・番号は入れないでください。\n\n【毎回固定：イラスト部分を少しリアルに】大人の首から下・胴体・腕・手・服・道具・背景は、イラストと分かる表現を維持しつつ、従来より一段だけ写実寄りのセミリアルなカラーイラストにする。実際の骨格・肩幅・手足の比率・指の関節に沿い、自然な筋肉の起伏、布の厚み・縫い目・しわ、素材の質感、柔らかな光と陰影で立体感を出す。太すぎる輪郭、平坦なベタ塗り、極端な頭身や漫画的な手足を避ける。本人の顔と髪は写真同等の写実表現のまま、顔立ち・髪型・髪色・年齢感を忠実に維持する。GKの子どもは架空の人物で顔・髪・体すべてイラスト調を維持し、自然な体の比率と柔らかな立体的な陰影を加えるが、実写・写真風にはしない。16文言・場面・人数・服装・白背景・4列4行・余白・ロゴなしの指定は変えない。"},"gk":{"name":"ゴールデンキッズ版","items":[{"text":"いつもありがとう！","scene":"コーチと子ども2人が笑顔で寄り添う。子どもはサムズアップ。ハート。"},{"text":"ありがとうございます！","scene":"コーチと子ども2人が目を閉じて両手を合わせる。キラキラ。"},{"text":"ごめんなさい","scene":"コーチと子ども2人が深く頭を下げる。汗のしずく。"},{"text":"いいね！","scene":"コーチと子ども2人がそろってサムズアップ。"},{"text":"今日も頑張ろう！","scene":"コーチと子ども2人がガッツポーズ。にっこり顔の太陽。"},{"text":"一生懸命！汗かいてなんぼ","scene":"コーチと子ども2人が全力で走る。汗が飛ぶ。"},{"text":"結果よりやろうとした気持ちが大切！","scene":"コーチが女の子の頭をやさしくなでる。ハート。"},{"text":"信念の継続は力なり！","scene":"コーチが拳を握って力強い表情。背景に炎。"},{"text":"スポーツは人生の道場だ","scene":"コーチと子ども3人が遠くを見つめる。青い空の背景。"},{"text":"正解なんてないんだから、自分を信じて進もう！","scene":"コーチがこちらを指さす。子ども2人がガッツポーズ。上向きの矢印。"},{"text":"コツコツ頑張っている姿を私は知ってるよ！","scene":"壁の陰からコーチと子ども2人がのぞいている。"},{"text":"ちーん…","scene":"コーチがひざを抱えて座り込み落ち込む。どんよりした縦線。小さなおばけ。"},{"text":"よろしくお願いします！","scene":"コーチと子ども2人が立った全身で深くおじぎ。靴まで収める。花。"},{"text":"成長はここから！","scene":"コーチと子ども2人がガッツポーズ。黄色の大きな上向き矢印。"},{"text":"無限の可能性を感じる！","scene":"コーチがこちらに手を伸ばす。両側に子ども2人。星空の背景。「感じろ！」に変えない。"},{"text":"意識してやることが大事！","scene":"コーチがこめかみに指を当てる。女の子が頬に手を当てて考える。電球。"}],"prompt":"最優先：写真を忠実に再現して！ Face and hair must be photorealistic, faithfully matching the supplied photograph, NOT illustrated, cartooned, painted, beautified, de-aged or stylized. Preserve actual facial geometry, age, hair and skin texture. Stylize ONLY bodies, clothes, hands, children, props and backgrounds.\n添付写真を本人の参照画像として、以下の条件を厳守したLINEスタンプ一覧画像を1枚作ってください。\n\n\n- 横長3:2の画像1枚に4列×4行の16コマ。左上から右へ、上段から順番。\n- 真っ白な背景。枠線・罫線なし。コマ間に十分な白い余白を設け、絵・文字・効果を各コマ内に完全に収める。\n- 最優先の固定指示：「写真を忠実に再現して！」。その回に添付された本人の顔写真を忠実に再現する。顔・髪は写真同等の写実表現にし、イラスト化・似顔絵化・アニメ化・水彩化・デフォルメをしない。顔立ち、目鼻口の形と位置、顔の輪郭、髪型、髪色、肌の質感、年齢感を変えず、美化・若返り・別人化をしない。表情だけは各場面に合わせて自然に変える。首から下の体・腕・手・服と、子ども・道具・背景のみ指定のイラスト調にする。顔の写実感を保ったまま、首の境目・光・色を自然になじませる。「自然になじませる」ために顔までイラスト化してはいけない。\n- 指定文言を一字一句そのまま使用。誤字・脱字・言い換え禁止。太く読みやすい手書き風文字に白フチ。\n- ブランド・企業ロゴ、実在商品名、マークは描かない。服や道具は無地。参照写真に写るロゴも引き継がない。以前のGKロゴ追加指定はこの標準には適用しない。\n\n\n\n\n\nコーチは添付写真の本人。胴体はユーザー添付「ゴールデンキッズ版フォーマット.png」に近い体のバランス・スポーツのポーズ・服の立体感にし、首から下（体・腕・手・服）を鮮明で丁寧なカラーイラストに固定。極端なミニキャラ化・幼児化・平面的な簡略化を避ける。本人の顔と髪は写真に忠実な写実表現のままとし、顔へイラスト調を適用しない。黒いスポーツTシャツに赤いライン、ロゴなし。子どもは架空の4〜7歳くらいの男の子と女の子で、顔・髪・体・腕・手・服まで完全にイラスト調に固定する。子どもを実写・写真風・写実的な人物にしない。参考見本の写真の子どもの顔をそのまま使わない。赤いTシャツ、明るい笑顔。元気で明るいポップな画風。キラキラ、ハート、汗マークなど。参考見本のロゴは再現しない。以下の固定文言・場面はそのまま維持する。\n\n1. 「いつもありがとう！」／コーチと子ども2人が笑顔で寄り添う。子どもはサムズアップ。ハート。\n2. 「ありがとうございます！」／コーチと子ども2人が目を閉じて両手を合わせる。キラキラ。\n3. 「ごめんなさい」／コーチと子ども2人が深く頭を下げる。汗のしずく。\n4. 「いいね！」／コーチと子ども2人がそろってサムズアップ。\n5. 「今日も頑張ろう！」／コーチと子ども2人がガッツポーズ。にっこり顔の太陽。\n6. 「一生懸命！汗かいてなんぼ」／コーチと子ども2人が全力で走る。汗が飛ぶ。\n7. 「結果よりやろうとした気持ちが大切！」／コーチが女の子の頭をやさしくなでる。ハート。\n8. 「信念の継続は力なり！」／コーチが拳を握って力強い表情。背景に炎。\n9. 「スポーツは人生の道場だ」／コーチと子ども3人が遠くを見つめる。青い空の背景。\n10. 「正解なんてないんだから、自分を信じて進もう！」／コーチがこちらを指さす。子ども2人がガッツポーズ。上向きの矢印。\n11. 「コツコツ頑張っている姿を私は知ってるよ！」／壁の陰からコーチと子ども2人がのぞいている。\n12. 「ちーん…」／コーチがひざを抱えて座り込み落ち込む。どんよりした縦線。小さなおばけ。\n13. 「よろしくお願いします！」／コーチと子ども2人が立った全身で深くおじぎ。靴まで収める。花。\n14. 「成長はここから！」／コーチと子ども2人がガッツポーズ。黄色の大きな上向き矢印。\n15. 「無限の可能性を感じる！」／コーチがこちらに手を伸ばす。両側に子ども2人。星空の背景。「感じろ！」に変えない。\n16. 「意識してやることが大事！」／コーチがこめかみに指を当てる。女の子が頬に手を当てて考える。電球。\n\n構図は均等な4列×4行です。全コマ内の文字と絵を端から離し、コマ間に十分な完全な白い余白を設けてください。写真の背景・商品・ロゴは使わず、本人の顔立ちと髪型・髪色・年齢感・肌の質感を忠実に再現してください。写真に忠実な写実的な顔と髪を、イラストの体へ光・色・首の境目を整えて自然につなげてください。自然につなぐために顔や髪をイラスト化してはいけません。指定された文言以外の余計な文字・番号は入れないでください。\n\n【毎回固定：イラスト部分を少しリアルに】大人の首から下・胴体・腕・手・服・道具・背景は、イラストと分かる表現を維持しつつ、従来より一段だけ写実寄りのセミリアルなカラーイラストにする。実際の骨格・肩幅・手足の比率・指の関節に沿い、自然な筋肉の起伏、布の厚み・縫い目・しわ、素材の質感、柔らかな光と陰影で立体感を出す。太すぎる輪郭、平坦なベタ塗り、極端な頭身や漫画的な手足を避ける。本人の顔と髪は写真同等の写実表現のまま、顔立ち・髪型・髪色・年齢感を忠実に維持する。GKの子どもは架空の人物で顔・髪・体すべてイラスト調を維持し、自然な体の比率と柔らかな立体的な陰影を加えるが、実写・写真風にはしない。16文言・場面・人数・服装・白背景・4列4行・余白・ロゴなしの指定は変えない。"}};
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
  if(path==='/health'&&request.method==='GET')return json({ok:true,apiKeyConfigured:Boolean(env.OPENAI_API_KEY),photoEditConfigured:Boolean(env.OPENAI_API_KEY&&env.STAMP_ACCESS_TOKEN),authConfigured:Boolean(env.STAMP_ACCESS_TOKEN),personPoseConfigured:Boolean(env.OPENAI_API_KEY&&env.STAMP_ACCESS_TOKEN),templateComposeConfigured:true,stickerSheetConfigured:true,presetVersion:"2026-10-27-semireal",faceStyle:"photorealistic",shareConfigured:Boolean(env.STAMP_SHARES)});
  const shared=path.match(/^\/shared\/([a-f0-9]{32})$/);
  if(shared&&request.method==='GET'){
   if(!env.STAMP_SHARES)return json({error:'共有画像の保存先が未設定です。'},503);
   const image=await env.STAMP_SHARES.get('sheet:'+shared[1],{type:'arrayBuffer'});
   if(!image)return json({error:'リンクの有効期限が切れたか、画像がありません。作成直後の場合は少し待って開き直してください。'},404);
   return new Response(image,{headers:{...headers,'Content-Type':'image/png','Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow, noarchive','Referrer-Policy':'no-referrer'}});
  }
  if(!['/session','/generate','/share'].includes(path))return json({error:'指定の機能はありません。'},404);
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
  if(path==='/share'){
   if(!env.STAMP_SHARES)return json({error:'共有画像の保存先が未設定です。'},503);
   if((request.headers.get('Content-Type')||'').split(';')[0]!=='image/png')return json({error:'共有する一覧画像はPNGで送信してください。'},415);
   const max=10*1024*1024;if(Number(request.headers.get('Content-Length'))>max)return json({error:'共有画像は10MB以内にしてください。'},413);
   const reader=request.body?.getReader();if(!reader)return json({error:'画像がありません。'},400);
   let total=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>max){await reader.cancel();return json({error:'共有画像は10MB以内にしてください。'},413);}chunks.push(value);}
   const bytes=new Uint8Array(total);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
   const signature=[137,80,78,71,13,10,26,10];if(total<33||signature.some((v,i)=>bytes[i]!==v)||String.fromCharCode(...bytes.slice(12,16))!=='IHDR')return json({error:'有効なPNG画像を選んでください。'},400);
   const info=new DataView(bytes.buffer),w=info.getUint32(16),h=info.getUint32(20);if(w<400||w>3840||h<200||w*2!==h*3)return json({error:'横長3:2の一覧画像だけ共有できます。'},400);
   const id=crypto.randomUUID().replaceAll('-',''),expiresAt=Date.now()+30*86400000;
   try{await env.STAMP_SHARES.put('sheet:'+id,bytes.buffer,{expirationTtl:30*86400});}catch{return json({error:'共有リンクを作成できませんでした。少し待って再実行してください。'},503);}
   return json({url:ORIGIN+'/stamp-maker/view.html#'+id,expiresAt});
  }
  if(!env.OPENAI_API_KEY)return json({error:'OpenAI APIキーが未設定です。'},503);
  if(!(request.headers.get('Content-Type')||'').includes('application/json'))return json({error:'画像をJSON形式で送信してください。'},415);
  try{
   const limit=Math.ceil((MAX_BYTES+4*1024*1024)*4/3)+8192;
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
    payload.prompt=identity+(canonical===2?'Create a front-view full-body scene of the adult coach standing in the center, bending deeply forward at the waist in a respectful Japanese bow, both hands on thighs or knees. The head is lowered so only the crown and back of the head and hair are visible; the face and eyes are completely hidden. A child in a red sports shirt and black shorts stands on each side, also bowing with faces hidden. Exactly one adult coach and two children.':'Create a photorealistic sports sticker of the adult coach in the reference photo taking a seated rest after exercise. The adult sits on a low bench with knees together, forearms resting across the knees, and head gently lowered onto the forearms. The camera sees the crown of the hair above the arms, matching the reference hairstyle and hair colour. Preserve the adult age and body build. Keep the adult fully dressed in the reference sportswear, with the full seated body and shoes in frame. One adult only, centered, transparent background, no text.');
   }
   if(body.mode==='template-heads-v1'){
    const isPNG=(v,max)=>typeof v==='string'&&v.length<=Math.ceil(max*4/3)+30&&/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(v)&&v.slice(v.indexOf(',')+1).length%4===0;
    if(!isPNG(body.template,3*1024*1024)||!isPNG(body.mask,1024*1024))return json({error:'合成用フォーマットまたはマスクの形式が違います。'},400);
    const groups=[[0,3,9],[1,6],[4,14],[5,8],[7,13],[10,15],[2,12],[11]],group=groups.find(g=>g.includes(body.index));
    payload.images=[{image_url:body.template},{image_url:body.photo}];payload.mask={image_url:body.mask};delete payload.background;
    payload.prompt='Edit IMAGE 1, a 1024 x 1024 contact sheet of cropped adult coach heads, using IMAGE 2 only as the identity and hairstyle reference. Keep the EXACT 2 by 2 grid, each tile exactly 512 x 512 pixels. There are '+group.length+' occupied tiles in row-major order; leave all unused white tiles unchanged. Replace only the masked adult head/face/hair regions with the adult person from IMAGE 2. Keep the exact position, head size, camera direction, head tilt, pose and crop of every input tile. Preserve realistic identity, age, hair colour and hairstyle of the reference adult. Preserve all unmasked pixels, children, hands, clothes and surroundings. Do not add panels, borders, text, objects or people. The crops have been resized to square tiles; preserve their geometry exactly so they can be placed back into their original frames. '+(canonical===2?'Both occupied tiles show a respectful Japanese bow. Preserve the lowered head angle; show the crown/back of the reference adult hair, with no visible face or eyes. Do not raise the head.':canonical===11?'The occupied tile shows the crown of the adult coach resting their head on their forearms during a break after sports. Preserve the resting pose. Keep the face hidden and adapt only the visible hair to the reference adult.':'Use the same '+EXPRESSIONS[canonical]+' in all occupied tiles while preserving the different original head angles. Do not copy the template coach facial identity.');
   }else if(body.mode!==undefined&&body.mode!=='sticker-sheet-v1')return json({error:'合成モードを確認してください。'},400);

   if(body.mode==='sticker-sheet-v1'){
    if(!Object.hasOwn(FIXED_PRESETS,body.edition))return json({error:'ゴルフ版またはゴールデンキッズ版を選んでください。'},400);
    Object.assign(payload,{model:'gpt-image-2',size:'1536x1024',quality:'high',background:'opaque',prompt:FIXED_PRESETS[body.edition].prompt,images:[{image_url:body.photo}]});
    delete payload.input_fidelity;delete payload.mask;
   }
   const upstream=await fetch('https://api.openai.com/v1/images/edits',{method:'POST',headers:{Authorization:'Bearer '+env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(payload),signal:AbortSignal.timeout(240000)});
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
