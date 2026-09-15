# デザイアカードジェネレーター

ブラウザだけでデザイアカードを作成できる、依存関係なしの静的サイトです。

仮面ライダーギーツのデザイアグランプリに着想を得たファンメイドUIです。

ページ下部の「画像をダウンロード」から、デザイアカードの裏面をPNGで保存できます。

「表面＋裏面を書き出す」では、作成した表面（`desire-card.png`）と裏面（`desire-back.png`）を `desire-card-set.zip` にまとめて保存します。ZIPを展開すると2枚のPNGを取り出せます。

## GitHub Pages で公開する

1. このフォルダのファイルを GitHub リポジトリへ push します。
2. リポジトリの **Settings → Pages** を開きます。
3. **Build and deployment** の Source で **Deploy from a branch** を選びます。
4. ブランチに `main`、フォルダに `/ (root)` を指定して保存します。

`index.html` がルートにあるため、ビルドツールやサーバー設定は必要ありません。

## ローカルで確認する

裏面画像を読み込んでZIPにまとめるため、任意の静的サーバーから開いてください。

```bash
python -m http.server 8000
```

その後、`http://localhost:8000` を開きます。
