# デザイアカードジェネレーター

ブラウザだけでデザイアカードを作成できる、依存関係なしの静的サイトです。

仮面ライダーギーツのデザイアグランプリに着想を得たファンメイドUIです。

ページ下部の「画像をダウンロード」から、デザイアカードの裏面をPNGで保存できます。

「表面＋裏面を書き出す」では、作成した表面（`desire-card.png`）と裏面（`desire-back.png`）を `desire-card-set.zip` にまとめて保存します。ZIPを展開すると2枚のPNGを取り出せます。

元画像 `desire.png` と `desire-back.png` は変更せず残しています。調整済み素材は [IMAGE_ASSETS.md](./IMAGE_ASSETS.md) を参照してください。公開サイトは静的ファイルとブラウザのCanvasだけで動作します。

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

## 書き出しの検証

ブラウザ用の回帰チェックを `tests/print-export.browser.js` に用意しています。ローカルページをagent-browserで開いた後、PowerShellでは次のように実行できます（agent-browserと対応ブラウザが必要です）。

```powershell
Get-Content tests/print-export.browser.js -Raw -Encoding UTF8 | npx.cmd --yes agent-browser eval --stdin
```

両面の寸法・不透明RGB PNG・4MB上限・端の白帯の有無、DONEの切り替え、素材一覧、通信失敗時の復帰を確認します。実際のZIPダウンロードの展開・PNG確認と、実機印刷の確認は別途行ってください。
