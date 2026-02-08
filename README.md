# フランス数字クイズ 11-99

## 携帯で遊ぶ（GitHub Pages で公開した場合）

公開後の URL を携帯のブラウザで開くだけです。

- **URL**: `https://<あなたのユーザー名>.github.io/<リポジトリ名>/`
- 例: リポジトリ名が `anki-quiz` なら  
  `https://<ユーザー名>.github.io/anki-quiz/`

npx serve は不要です。

---

## GitHub Pages で公開する手順

### 1. リポジトリに push

```bash
cd /Users/air2020/Desktop/anki
git init
git add .
git commit -m "Add French numbers quiz"
git branch -M main
git remote add origin https://github.com/<ユーザー名>/<リポジトリ名>.git
git push -u origin main
```

### 2. GitHub で Pages を有効化

- リポジトリの **Settings → Pages**
- **Source**: Deploy from a branch
- **Branch**: `main`、フォルダ: **/ (root)** を選んで Save
- 数分後、**Actions** タブで “pages build and deployment” が成功すれば完了

### 3. 公開 URL

- **Settings → Pages** の上部に表示される URL が公開先です
- その URL を携帯のブラウザで開けば、どこからでもクイズで遊べます

### 別の方法: GitHub Actions でデプロイ

- `main` に push するたびに自動で Pages に反映したい場合は、リポジトリの **Settings → Pages** で **Source** を **GitHub Actions** に変更してください
- このリポジトリには `.github/workflows/deploy-pages.yml` が含まれているので、そのまま利用できます

---

## ローカルで試す（携帯で遊ぶ）

1. このフォルダでターミナルを開き、次を実行:
   ```bash
   npx serve
   ```
   または
   ```bash
   npm run serve
   ```

2. ブラウザで http://localhost:3000 を開く

3. ページ右下の **📱 URL** を押す → 携帯用の URL と QR コードが表示される（同じ Wi-Fi なら自動で LAN 用 URL になる）

4. 表示された URL を携帯のブラウザに入力するか、QR コードをスキャンする

5. 携帯でクイズが開きます
