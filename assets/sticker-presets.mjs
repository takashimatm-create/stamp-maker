// Exact user-supplied prompts. Literal newlines are intentional template literals.
export const PRESETS={
  "golf": {
    "name": "ゴルフ版",
    "items": [{"text":"おはようございます！","scene":"片手を上げてあいさつ。横にキャディバッグ。晴れたゴルフ場と太陽。"},{"text":"流石だね！","scene":"白いポロシャツでサムズアップ。キリッとした表情。"},{"text":"いい読みだ","scene":"グリーン上でしゃがんでラインを読む。パターとボール、奥に旗。"},{"text":"無理せず、できることをやろう！","scene":"サンバイザー姿で水筒の水を飲む。ゴルフ場。"},{"text":"行ってきます！","scene":"黄色いポロシャツでバッグを肩に掛け、ガッツポーズ。笑顔。"},{"text":"やっとバンカーから脱出！","scene":"バンカーショットの瞬間。砂が大きく舞う。"},{"text":"やったぜ！","scene":"青いポロシャツでガッツポーズ。満面の笑み。"},{"text":"確認します！","scene":"ノートパソコンの画面を真剣に見る。"},{"text":"ダボちんスキー","scene":"頭を抱えて落ち込む。倒れたドライバーとボール。頭上にもやもや。"},{"text":"神様ありがとう！","scene":"緑のポロシャツで空を見上げて指さす。キラキラ。"},{"text":"すみません！修行が足りない…練習してきます","scene":"キャディバッグを担いだ後ろ姿で練習場へ向かう。「練習場」の看板。"},{"text":"OK！その調子！","scene":"白いポロシャツでサムズアップ。勢いの線。"},{"text":"今から帰るよー","scene":"キャディバッグを担いだ後ろ姿で手を振る。奥にゴルフカート。"},{"text":"ありがとうございます！","scene":"両手を合わせて感謝。ハート。スコアカード。"},{"text":"スコアは忘れてとりあえず飲もう！","scene":"ビールジョッキを持ってサムズアップ。枝豆とおつまみ。"},{"text":"おやすみ！","scene":"布団で気持ちよく寝ている。夢の吹き出しにゴルフ場と「バーディー！」の文字。Zzz。"}],
    "prompt": `TASK: Using the attached photo, create ONE LINE sticker sheet image.

STYLE CONCEPT (intentional mixed media): "photo-head collage stickers".
The adult's head is a REAL PHOTOGRAPH cut out from the attached photo, placed on a hand-drawn illustrated body. The visible style gap between the photo head and the drawn body is DESIRED. Do NOT unify, harmonize or blend the styles.

=== RULE 1: THE HEAD (highest priority, overrides everything else) ===
- The adult's head (face, hair, ears) must look like an actual photograph of the person in the attached photo: same identity, facial geometry, eye/nose/mouth shape and position, face outline, skin texture with pores and fine wrinkles, real age, hairline, hairstyle, hair color.
- Show it as a photo cutout with real camera lighting, and a thin white sticker outline around the head.
- NEVER draw, paint, cartoon, anime, line-art, cel-shade, airbrush, smooth, beautify or de-age the head. When in doubt, make the head MORE photographic, not less.
- Allowed changes only: a mild expression matching the scene (smile, determined, sad, eyes closed), and head angle within about 30 degrees of the photo. Keep it recognizable as the same person in every panel.
- Ignore the photo's background, clothes and any logos.

=== RULE 2: EVERYTHING ELSE IS ILLUSTRATION ===
Body below the neck, clothes, hands, props, effects and backgrounds are illustrated:
Clean color illustration with natural adult proportions, semi-realistic shading, fabric folds on plain golf polo shirts (colors may change per sticker: white, navy, blue, yellow, green). Not chibi, not flat, not heavy anime. Golf course or driving range backgrounds only where the scene requires.

=== RULE 3: LAYOUT ===
- Landscape 3:2, exactly 4 columns x 4 rows = 16 stickers, ordered left-to-right, top-to-bottom.
- Pure white background, no frames or grid lines. Wide white gaps between stickers. Every drawing, text and effect stays fully inside its own cell.
- Make each head as large as the cell allows (head-and-upper-body framing), except where a full-body pose is specified.
- No logos, brand names, marks, numbers, or any text other than the specified phrases.

=== RULE 4: TEXT ===
Use each Japanese phrase exactly as written, character for character. No typos, no paraphrasing, no omissions.
Bold, friendly hand-lettered Japanese text with a thick white outline.

=== 16 STICKERS (phrase / scene) ===
1. 「おはようございます！」／片手を上げてあいさつ。横にキャディバッグ。晴れたゴルフ場と太陽。
2. 「流石だね！」／白いポロシャツでサムズアップ。キリッとした表情。
3. 「いい読みだ」／グリーン上でしゃがんでラインを読む。パターとボール、奥に旗。
4. 「無理せず、できることをやろう！」／サンバイザー姿で水筒の水を飲む。ゴルフ場。
5. 「行ってきます！」／黄色いポロシャツでバッグを肩に掛け、ガッツポーズ。笑顔。
6. 「やっとバンカーから脱出！」／バンカーショットの瞬間。砂が大きく舞う。
7. 「やったぜ！」／青いポロシャツでガッツポーズ。満面の笑み。
8. 「確認します！」／ノートパソコンの画面を真剣に見る。
9. 「ダボちんスキー」／頭を抱えて落ち込む。倒れたドライバーとボール。頭上にもやもや。
10. 「神様ありがとう！」／緑のポロシャツで空を見上げて指さす。キラキラ。
11. 「すみません！修行が足りない…練習してきます」／キャディバッグを担いだ後ろ姿で練習場へ向かう。「練習場」の看板。
12. 「OK！その調子！」／白いポロシャツでサムズアップ。勢いの線。
13. 「今から帰るよー」／キャディバッグを担いだ後ろ姿で手を振る。奥にゴルフカート。
14. 「ありがとうございます！」／両手を合わせて感謝。ハート。スコアカード。
15. 「スコアは忘れてとりあえず飲もう！」／ビールジョッキを持ってサムズアップ。枝豆とおつまみ。
16. 「おやすみ！」／布団で気持ちよく寝ている。夢の吹き出しにゴルフ場と「バーディー！」の文字。Zzz。

FINAL CHECK before output: In all 16 stickers, is the adult's head a photograph identical to the attached person, NOT a drawing? If any head looks illustrated, redraw it as a photo cutout.`
  },
  "gk": {
    "name": "ゴールデンキッズ版",
    "items": [{"text":"いつもありがとう！","scene":"コーチと子ども2人が笑顔で寄り添う。子どもはサムズアップ。ハート。"},{"text":"ありがとうございます！","scene":"コーチと子ども2人が目を閉じて両手を合わせる。キラキラ。"},{"text":"ごめんなさい","scene":"コーチと子ども2人が深く頭を下げる。汗のしずく。"},{"text":"いいね！","scene":"コーチと子ども2人がそろってサムズアップ。"},{"text":"今日も頑張ろう！","scene":"コーチと子ども2人がガッツポーズ。にっこり顔の太陽。"},{"text":"一生懸命！汗かいてなんぼ","scene":"コーチと子ども2人が全力で走る。汗が飛ぶ。"},{"text":"結果よりやろうとした気持ちが大切！","scene":"コーチが女の子の頭をやさしくなでる。ハート。"},{"text":"信念の継続は力なり！","scene":"コーチが拳を握って力強い表情。背景に炎。"},{"text":"スポーツは人生の道場だ","scene":"コーチと子ども3人が遠くを見つめる。青い空の背景。"},{"text":"正解なんてないんだから、自分を信じて進もう！","scene":"コーチがこちらを指さす。子ども2人がガッツポーズ。上向きの矢印。"},{"text":"コツコツ頑張っている姿を私は知ってるよ！","scene":"壁の陰からコーチと子ども2人がのぞいている。"},{"text":"ちーん…","scene":"コーチがひざを抱えて座り込み落ち込む。どんよりした縦線。小さなおばけ。"},{"text":"よろしくお願いします！","scene":"コーチと子ども2人が立った全身で深くおじぎ。靴まで収める。花。"},{"text":"成長はここから！","scene":"コーチと子ども2人がガッツポーズ。黄色の大きな上向き矢印。"},{"text":"無限の可能性を感じる！","scene":"コーチがこちらに手を伸ばす。両側に子ども2人。星空の背景。「感じろ！」に変えない。"},{"text":"意識してやることが大事！","scene":"コーチがこめかみに指を当てる。女の子が頬に手を当てて考える。電球。"}],
    "prompt": `TASK: Using the attached photo, create ONE LINE sticker sheet image.

STYLE CONCEPT (intentional mixed media): "photo-head collage stickers".
The adult's head is a REAL PHOTOGRAPH cut out from the attached photo, placed on a hand-drawn illustrated body. The visible style gap between the photo head and the drawn body is DESIRED. Do NOT unify, harmonize or blend the styles.

=== RULE 1: THE HEAD (highest priority, overrides everything else) ===
- The adult's head (face, hair, ears) must look like an actual photograph of the person in the attached photo: same identity, facial geometry, eye/nose/mouth shape and position, face outline, skin texture with pores and fine wrinkles, real age, hairline, hairstyle, hair color.
- Show it as a photo cutout with real camera lighting, and a thin white sticker outline around the head.
- NEVER draw, paint, cartoon, anime, line-art, cel-shade, airbrush, smooth, beautify or de-age the head. When in doubt, make the head MORE photographic, not less.
- Allowed changes only: a mild expression matching the scene (smile, determined, sad, eyes closed), and head angle within about 30 degrees of the photo. Keep it recognizable as the same person in every panel.
- Ignore the photo's background, clothes and any logos.

=== RULE 2: EVERYTHING ELSE IS ILLUSTRATION ===
Body below the neck, clothes, hands, props, effects and backgrounds are illustrated:
Clean, bright, pop color illustration with semi-realistic proportions and soft shading (natural shoulders, hands with proper fingers, fabric folds). Not chibi, not flat.
The adult coach wears a plain black sports T-shirt with a red line, no logo.
The children are fictional boys and girls aged about 4-7, FULLY illustrated (face, hair and body all drawn) in a cheerful pop style, wearing plain red T-shirts. Children must NEVER be photographic. Only the adult's head is a photo.
Add sparkles, hearts, sweat drops where the scene calls for them.

=== RULE 3: LAYOUT ===
- Landscape 3:2, exactly 4 columns x 4 rows = 16 stickers, ordered left-to-right, top-to-bottom.
- Pure white background, no frames or grid lines. Wide white gaps between stickers. Every drawing, text and effect stays fully inside its own cell.
- Make each head as large as the cell allows (head-and-upper-body framing), except where a full-body pose is specified.
- No logos, brand names, marks, numbers, or any text other than the specified phrases.

=== RULE 4: TEXT ===
Use each Japanese phrase exactly as written, character for character. No typos, no paraphrasing, no omissions.
Bold, friendly hand-lettered Japanese text with a thick white outline.

=== 16 STICKERS (phrase / scene) ===
1. 「いつもありがとう！」／コーチと子ども2人が笑顔で寄り添う。子どもはサムズアップ。ハート。
2. 「ありがとうございます！」／コーチと子ども2人が目を閉じて両手を合わせる。キラキラ。
3. 「ごめんなさい」／コーチと子ども2人が深く頭を下げる。汗のしずく。
4. 「いいね！」／コーチと子ども2人がそろってサムズアップ。
5. 「今日も頑張ろう！」／コーチと子ども2人がガッツポーズ。にっこり顔の太陽。
6. 「一生懸命！汗かいてなんぼ」／コーチと子ども2人が全力で走る。汗が飛ぶ。
7. 「結果よりやろうとした気持ちが大切！」／コーチが女の子の頭をやさしくなでる。ハート。
8. 「信念の継続は力なり！」／コーチが拳を握って力強い表情。背景に炎。
9. 「スポーツは人生の道場だ」／コーチと子ども3人が遠くを見つめる。青い空の背景。
10. 「正解なんてないんだから、自分を信じて進もう！」／コーチがこちらを指さす。子ども2人がガッツポーズ。上向きの矢印。
11. 「コツコツ頑張っている姿を私は知ってるよ！」／壁の陰からコーチと子ども2人がのぞいている。
12. 「ちーん…」／コーチがひざを抱えて座り込み落ち込む。どんよりした縦線。小さなおばけ。
13. 「よろしくお願いします！」／コーチと子ども2人が立った全身で深くおじぎ。靴まで収める。花。
14. 「成長はここから！」／コーチと子ども2人がガッツポーズ。黄色の大きな上向き矢印。
15. 「無限の可能性を感じる！」／コーチがこちらに手を伸ばす。両側に子ども2人。星空の背景。「感じろ！」に変えない。
16. 「意識してやることが大事！」／コーチがこめかみに指を当てる。女の子が頬に手を当てて考える。電球。

FINAL CHECK before output: In all 16 stickers, is the adult's head a photograph identical to the attached person, NOT a drawing? If any head looks illustrated, redraw it as a photo cutout.`
  },
  "golf-jojo": {
    "name": "ゴルフジョジョ風",
    "items": [{"text":"おはようございます！","scene":"片手を上げてあいさつ。横にキャディバッグ。晴れたゴルフ場と太陽。"},{"text":"流石だね！","scene":"白いポロシャツでサムズアップ。キリッとした表情。"},{"text":"いい読みだ","scene":"グリーン上でしゃがんでラインを読む。パターとボール、奥に旗。"},{"text":"無理せず、できることをやろう！","scene":"サンバイザー姿で水筒の水を飲む。ゴルフ場。"},{"text":"行ってきます！","scene":"黄色いポロシャツでバッグを肩に掛け、ガッツポーズ。笑顔。"},{"text":"やっとバンカーから脱出！","scene":"バンカーショットの瞬間。砂が大きく舞う。"},{"text":"やったぜ！","scene":"青いポロシャツでガッツポーズ。満面の笑み。"},{"text":"確認します！","scene":"ノートパソコンの画面を真剣に見る。"},{"text":"ダボちんスキー","scene":"頭を抱えて落ち込む。倒れたドライバーとボール。頭上にもやもや。"},{"text":"神様ありがとう！","scene":"緑のポロシャツで空を見上げて指さす。キラキラ。"},{"text":"すみません！修行が足りない…練習してきます","scene":"キャディバッグを担いだ後ろ姿で練習場へ向かう。「練習場」の看板。"},{"text":"OK！その調子！","scene":"白いポロシャツでサムズアップ。勢いの線。"},{"text":"今から帰るよー","scene":"キャディバッグを担いだ後ろ姿で手を振る。奥にゴルフカート。"},{"text":"ありがとうございます！","scene":"両手を合わせて感謝。ハート。スコアカード。"},{"text":"スコアは忘れてとりあえず飲もう！","scene":"ビールジョッキを持ってサムズアップ。枝豆とおつまみ。"},{"text":"おやすみ！","scene":"布団で気持ちよく寝ている。夢の吹き出しにゴルフ場と「バーディー！」の文字。Zzz。"}],
    "prompt": `TASK: Using the attached photo, create ONE LINE sticker sheet image.

STYLE CONCEPT (intentional mixed media): "photo-head collage stickers".
The adult's head is a REAL PHOTOGRAPH cut out from the attached photo, placed on a hand-drawn illustrated body. The visible style gap between the photo head and the drawn body is DESIRED. Do NOT unify, harmonize or blend the styles.

=== RULE 1: THE HEAD (highest priority, overrides everything else) ===
- The adult's head (face, hair, ears) must look like an actual photograph of the person in the attached photo: same identity, facial geometry, eye/nose/mouth shape and position, face outline, skin texture with pores and fine wrinkles, real age, hairline, hairstyle, hair color.
- Show it as a photo cutout with real camera lighting, and a thin white sticker outline around the head.
- NEVER draw, paint, cartoon, anime, line-art, cel-shade, airbrush, smooth, beautify or de-age the head. When in doubt, make the head MORE photographic, not less.
- Allowed changes only: a mild expression matching the scene (smile, determined, sad, eyes closed), and head angle within about 30 degrees of the photo. Keep it recognizable as the same person in every panel.
- Ignore the photo's background, clothes and any logos.

=== RULE 2: EVERYTHING ELSE IS ILLUSTRATION ===
Body below the neck, clothes, hands, props, effects and backgrounds are illustrated:
Clean color illustration with natural adult proportions, semi-realistic shading, fabric folds on plain golf polo shirts (colors may change per sticker: white, navy, blue, yellow, green). Not chibi, not flat, not heavy anime. Golf course or driving range backgrounds only where the scene requires.
Render the illustrated parts (body, clothes, props, background) in a dramatic heavy-ink manga style: bold expressive ink lines, cross-hatching, sculptural dark shadows, dynamic poses with strong perspective, speed lines kept inside the cell, vivid purple / emerald / gold palette. Do not add any existing manga characters, costumes, logos or sound-effect text.
This ink style applies ONLY below the neck. The adult's head stays an untouched photograph with no ink lines or hatching on it.

=== RULE 3: LAYOUT ===
- Landscape 3:2, exactly 4 columns x 4 rows = 16 stickers, ordered left-to-right, top-to-bottom.
- Pure white background, no frames or grid lines. Wide white gaps between stickers. Every drawing, text and effect stays fully inside its own cell.
- Make each head as large as the cell allows (head-and-upper-body framing), except where a full-body pose is specified.
- No logos, brand names, marks, numbers, or any text other than the specified phrases.

=== RULE 4: TEXT ===
Use each Japanese phrase exactly as written, character for character. No typos, no paraphrasing, no omissions.
Extra-bold Japanese display lettering with double or triple outlines, strong black drop shadow, 3D thickness, slightly slanted, still fully readable and inside the cell.

=== 16 STICKERS (phrase / scene) ===
1. 「おはようございます！」／片手を上げてあいさつ。横にキャディバッグ。晴れたゴルフ場と太陽。
2. 「流石だね！」／白いポロシャツでサムズアップ。キリッとした表情。
3. 「いい読みだ」／グリーン上でしゃがんでラインを読む。パターとボール、奥に旗。
4. 「無理せず、できることをやろう！」／サンバイザー姿で水筒の水を飲む。ゴルフ場。
5. 「行ってきます！」／黄色いポロシャツでバッグを肩に掛け、ガッツポーズ。笑顔。
6. 「やっとバンカーから脱出！」／バンカーショットの瞬間。砂が大きく舞う。
7. 「やったぜ！」／青いポロシャツでガッツポーズ。満面の笑み。
8. 「確認します！」／ノートパソコンの画面を真剣に見る。
9. 「ダボちんスキー」／頭を抱えて落ち込む。倒れたドライバーとボール。頭上にもやもや。
10. 「神様ありがとう！」／緑のポロシャツで空を見上げて指さす。キラキラ。
11. 「すみません！修行が足りない…練習してきます」／キャディバッグを担いだ後ろ姿で練習場へ向かう。「練習場」の看板。
12. 「OK！その調子！」／白いポロシャツでサムズアップ。勢いの線。
13. 「今から帰るよー」／キャディバッグを担いだ後ろ姿で手を振る。奥にゴルフカート。
14. 「ありがとうございます！」／両手を合わせて感謝。ハート。スコアカード。
15. 「スコアは忘れてとりあえず飲もう！」／ビールジョッキを持ってサムズアップ。枝豆とおつまみ。
16. 「おやすみ！」／布団で気持ちよく寝ている。夢の吹き出しにゴルフ場と「バーディー！」の文字。Zzz。

FINAL CHECK before output: In all 16 stickers, is the adult's head a photograph identical to the attached person, NOT a drawing? If any head looks illustrated, redraw it as a photo cutout.`,
    "family": "golf",
    "visualStyle": "jojo"
  },
  "gk-jojo": {
    "name": "ゴールデンキッズジョジョ風",
    "items": [{"text":"いつもありがとう！","scene":"コーチと子ども2人が笑顔で寄り添う。子どもはサムズアップ。ハート。"},{"text":"ありがとうございます！","scene":"コーチと子ども2人が目を閉じて両手を合わせる。キラキラ。"},{"text":"ごめんなさい","scene":"コーチと子ども2人が深く頭を下げる。汗のしずく。"},{"text":"いいね！","scene":"コーチと子ども2人がそろってサムズアップ。"},{"text":"今日も頑張ろう！","scene":"コーチと子ども2人がガッツポーズ。にっこり顔の太陽。"},{"text":"一生懸命！汗かいてなんぼ","scene":"コーチと子ども2人が全力で走る。汗が飛ぶ。"},{"text":"結果よりやろうとした気持ちが大切！","scene":"コーチが女の子の頭をやさしくなでる。ハート。"},{"text":"信念の継続は力なり！","scene":"コーチが拳を握って力強い表情。背景に炎。"},{"text":"スポーツは人生の道場だ","scene":"コーチと子ども3人が遠くを見つめる。青い空の背景。"},{"text":"正解なんてないんだから、自分を信じて進もう！","scene":"コーチがこちらを指さす。子ども2人がガッツポーズ。上向きの矢印。"},{"text":"コツコツ頑張っている姿を私は知ってるよ！","scene":"壁の陰からコーチと子ども2人がのぞいている。"},{"text":"ちーん…","scene":"コーチがひざを抱えて座り込み落ち込む。どんよりした縦線。小さなおばけ。"},{"text":"よろしくお願いします！","scene":"コーチと子ども2人が立った全身で深くおじぎ。靴まで収める。花。"},{"text":"成長はここから！","scene":"コーチと子ども2人がガッツポーズ。黄色の大きな上向き矢印。"},{"text":"無限の可能性を感じる！","scene":"コーチがこちらに手を伸ばす。両側に子ども2人。星空の背景。「感じろ！」に変えない。"},{"text":"意識してやることが大事！","scene":"コーチがこめかみに指を当てる。女の子が頬に手を当てて考える。電球。"}],
    "prompt": `TASK: Using the attached photo, create ONE LINE sticker sheet image.

STYLE CONCEPT (intentional mixed media): "photo-head collage stickers".
The adult's head is a REAL PHOTOGRAPH cut out from the attached photo, placed on a hand-drawn illustrated body. The visible style gap between the photo head and the drawn body is DESIRED. Do NOT unify, harmonize or blend the styles.

=== RULE 1: THE HEAD (highest priority, overrides everything else) ===
- The adult's head (face, hair, ears) must look like an actual photograph of the person in the attached photo: same identity, facial geometry, eye/nose/mouth shape and position, face outline, skin texture with pores and fine wrinkles, real age, hairline, hairstyle, hair color.
- Show it as a photo cutout with real camera lighting, and a thin white sticker outline around the head.
- NEVER draw, paint, cartoon, anime, line-art, cel-shade, airbrush, smooth, beautify or de-age the head. When in doubt, make the head MORE photographic, not less.
- Allowed changes only: a mild expression matching the scene (smile, determined, sad, eyes closed), and head angle within about 30 degrees of the photo. Keep it recognizable as the same person in every panel.
- Ignore the photo's background, clothes and any logos.

=== RULE 2: EVERYTHING ELSE IS ILLUSTRATION ===
Body below the neck, clothes, hands, props, effects and backgrounds are illustrated:
Clean, bright, pop color illustration with semi-realistic proportions and soft shading (natural shoulders, hands with proper fingers, fabric folds). Not chibi, not flat.
The adult coach wears a plain black sports T-shirt with a red line, no logo.
The children are fictional boys and girls aged about 4-7, FULLY illustrated (face, hair and body all drawn) in a cheerful pop style, wearing plain red T-shirts. Children must NEVER be photographic. Only the adult's head is a photo.
Add sparkles, hearts, sweat drops where the scene calls for them.
Render the illustrated parts (body, clothes, props, background) in a dramatic heavy-ink manga style: bold expressive ink lines, cross-hatching, sculptural dark shadows, dynamic poses with strong perspective, speed lines kept inside the cell, vivid purple / emerald / gold palette. Do not add any existing manga characters, costumes, logos or sound-effect text.
This ink style applies ONLY below the neck. The adult's head stays an untouched photograph with no ink lines or hatching on it.
Children stay bright, cheerful, fully illustrated, never photographic.

=== RULE 3: LAYOUT ===
- Landscape 3:2, exactly 4 columns x 4 rows = 16 stickers, ordered left-to-right, top-to-bottom.
- Pure white background, no frames or grid lines. Wide white gaps between stickers. Every drawing, text and effect stays fully inside its own cell.
- Make each head as large as the cell allows (head-and-upper-body framing), except where a full-body pose is specified.
- No logos, brand names, marks, numbers, or any text other than the specified phrases.

=== RULE 4: TEXT ===
Use each Japanese phrase exactly as written, character for character. No typos, no paraphrasing, no omissions.
Extra-bold Japanese display lettering with double or triple outlines, strong black drop shadow, 3D thickness, slightly slanted, still fully readable and inside the cell.

=== 16 STICKERS (phrase / scene) ===
1. 「いつもありがとう！」／コーチと子ども2人が笑顔で寄り添う。子どもはサムズアップ。ハート。
2. 「ありがとうございます！」／コーチと子ども2人が目を閉じて両手を合わせる。キラキラ。
3. 「ごめんなさい」／コーチと子ども2人が深く頭を下げる。汗のしずく。
4. 「いいね！」／コーチと子ども2人がそろってサムズアップ。
5. 「今日も頑張ろう！」／コーチと子ども2人がガッツポーズ。にっこり顔の太陽。
6. 「一生懸命！汗かいてなんぼ」／コーチと子ども2人が全力で走る。汗が飛ぶ。
7. 「結果よりやろうとした気持ちが大切！」／コーチが女の子の頭をやさしくなでる。ハート。
8. 「信念の継続は力なり！」／コーチが拳を握って力強い表情。背景に炎。
9. 「スポーツは人生の道場だ」／コーチと子ども3人が遠くを見つめる。青い空の背景。
10. 「正解なんてないんだから、自分を信じて進もう！」／コーチがこちらを指さす。子ども2人がガッツポーズ。上向きの矢印。
11. 「コツコツ頑張っている姿を私は知ってるよ！」／壁の陰からコーチと子ども2人がのぞいている。
12. 「ちーん…」／コーチがひざを抱えて座り込み落ち込む。どんよりした縦線。小さなおばけ。
13. 「よろしくお願いします！」／コーチと子ども2人が立った全身で深くおじぎ。靴まで収める。花。
14. 「成長はここから！」／コーチと子ども2人がガッツポーズ。黄色の大きな上向き矢印。
15. 「無限の可能性を感じる！」／コーチがこちらに手を伸ばす。両側に子ども2人。星空の背景。「感じろ！」に変えない。
16. 「意識してやることが大事！」／コーチがこめかみに指を当てる。女の子が頬に手を当てて考える。電球。

FINAL CHECK before output: In all 16 stickers, is the adult's head a photograph identical to the attached person, NOT a drawing? If any head looks illustrated, redraw it as a photo cutout.`,
    "family": "gk",
    "visualStyle": "jojo"
  }
};
