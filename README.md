# 🎂 HBD — 誕生日招待状サイト

パートナーの誕生日用の、招待状チックなWebサイトです。
封筒を開くと招待状が現れ、質問に答えてもらうと、回答がこのリポジトリの
`answers/` フォルダに JSON として自動保存されます。

黄色 × 水色を基調にした、ペーパーアイテム(紙の招待状)調の上品なデザインです。
封蝋つきの封筒を開封する演出と、送信時の紙吹雪だけ、ささやかに華やかです。

## 🌐 公開のしかた(GitHub Pages)

1. このリポジトリの **Settings → Pages** を開く
2. **Source: Deploy from a branch**、Branch にデフォルトブランチ(main)と `/ (root)` を選んで保存
3. 数分待つと `https://kmiyanaga96.github.io/HBD/` で公開されます

> ⚠️ 一般利用はしない前提ですが、Pages は URL を知っていれば誰でも見られます。
> `noindex` は設定済みなので検索には載りません。

## 🔑 回答を自動保存できるようにする(トークンの用意)

回答の保存には GitHub のトークンが必要です。トークンは**リポジトリには置かず、
彼女に送るURLの末尾に付けて**渡します。

1. GitHub の [Fine-grained personal access tokens](https://github.com/settings/personal-access-tokens/new) を開く
2. 次のように設定して **Generate token**
   - **Repository access**: Only select repositories → `kmiyanaga96/HBD` だけを選択
   - **Permissions → Repository permissions → Contents**: `Read and write`
   - **Expiration**: 誕生日が終わる頃まで(短めがおすすめ)
3. できたトークン(`github_pat_...`)を、URL の後ろに `#k=` で付ける:

   ```
   https://kmiyanaga96.github.io/HBD/#k=github_pat_XXXXXXXX
   ```

4. **このURLを彼女に送る**だけでOK!
   トークン部分はページを開いた瞬間にURLから消える仕組みなので、
   アドレスバーやブックマークには残りません。

> 💡 トークンなしのURLで開いた場合は、送信時に回答のJSONファイルが
> ダウンロードされる仕組みになっています(それを送ってもらってもOK)。

> 🔒 このトークンはこのリポジトリの中身の読み書きしかできませんが、
> 用が済んだら [トークン一覧](https://github.com/settings/personal-access-tokens) から削除しておくと安心です。

## ✏️ 質問やメッセージを変える

**`js/questions.js`** を開いて編集するだけです。

- `CONFIG.herName` — 彼女の呼び名
- `CONFIG.letterMessage` — 招待状のメッセージ
- `QUESTIONS` — 質問と選択肢のリスト
  - `multiple: true` を付けると複数選択できる質問になります
  - 選択肢や質問はいくつでも増減OK

## 📬 回答の見かた

彼女が送信すると、`answers/answer-日時.json` がコミットされます。
コミットメッセージにも「🎂 誕生日の回答が届きました」と出るので、
リポジトリの Commits を見ればすぐ気づけます。

```json
{
  "submittedAt": "2026-07-20T10:00:00.000Z",
  "answers": [
    { "question": "誕生日ディナー、なにが食べたい?", "selected": ["お寿司 🍣"] }
  ]
}
```

## 🗂 ファイル構成

```
index.html        ページ本体
css/style.css     デザイン(黄色×水色)
js/questions.js   ★質問・メッセージの設定(ここだけ編集すればOK)
js/app.js         画面の動きと回答の保存処理
js/confetti.js    紙吹雪
answers/          回答が保存されるフォルダ
```
