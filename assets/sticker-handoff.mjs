export function safeName(value){return String(value||'').trim().replace(/[\\/:*?"<>|\u0000-\u001f]/g,'_').slice(0,60);}
function limited(value,max){let n=0,out='';for(const ch of value){const w=ch.codePointAt(0)>127?2:1;if(n+w>max)break;out+=ch;n+=w;}return out;}
export function handoffText({name,edition,link='',creator=''}){
 const person=String(name||'').trim().replace(/さん$/,'')||'【名前を入力】',golf=edition.startsWith('golf'),kind=golf?'ゴルフ':'ゴールデンキッズ';
 const title=limited(person+'の'+kind+'スタンプ',40);
 return {
  title,description:limited(person+'さんの'+kind+'をテーマにした、日常で使える16種類のスタンプです。',160),
  englishTitle:golf?'Golf Days':'Golden Kids Coach',englishDescription:golf?'16 cheerful golf stickers for everyday conversations.':'16 cheerful sports coach stickers for everyday conversations.',
  copyright:creator.trim()?'(C) '+creator.trim():'',
  approval:person+'さん、いつもありがとうございます！\nLINEスタンプを作ってみました🏃✨ まずは画像をどうぞ！\n\n'+(link||'（リンク）')+'\n\nご了承いただけたら、LINEストアには出さない設定で申請して、プレゼントしますね。\n審査は1週間ほどを目安にしていますが、前後する場合があります。もう少しお待ちください😊'
 };
}
