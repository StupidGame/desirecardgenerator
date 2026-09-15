# デザイアカードジェネレーター

ブラウザだけでデザイアカードを作成できる、依存関係なしの静的サイトです。

仮面ライダーギーツのデザイアグランプリに着想を得たファンメイドUIです。

ページ下部の「画像をダウンロード」から、デザイアカードの裏面をPNGで保存できます。

「表面＋裏面を書き出す」では、作成した表面（`desire-card.png`）と裏面（`desire-back.png`）を `desire-card-set.zip` にまとめて保存します。ZIPを展開すると2枚のPNGを取り出せます。

## カードコネクトで印刷する

両面ともカードコネクトの **PROアップロード（横向き）** 向けに書き出します。

- サイズ：2072×1328px、sRGB、不透明PNG。1枚4MB以下を確認して保存します。
- 余白は追加しません。元の表裏を参照して画像生成で印刷比率に調整した絵柄を、画像の端まで配置します。元からある白い記入欄・金色の枠はデザインの一部です。
- 書き出し時は縦横比を維持した全面配置で2072×1328pxに統一します。生成素材との微小な比率差は端の切り取りで吸収し、引き伸ばしや白帯の追加はしません。
- 表面のプレビュー、ZIP内の両面画像、裏面単体の保存に同じ配置ルールを使います。
- 願い・サイン・DONEスタンプは表面の絵柄と一緒に拡大・縮小されます。

ZIPを展開し、[PROアップロードの手順](https://p.eagate.573.jp/game/card_connect/2/original/cc/howto.html)に従って、`desire-card.png` を表面、`desire-back.png` を裏面に指定してください。両面とも同じ向きで書き出すため、裏面を反転・回転する必要はありません。

仕様の参照先：[公式テンプレート](https://p.eagate.573.jp/game/card_connect/2/original/cc/template.html)、[仕様・制限事項](https://p.eagate.573.jp/game/card_connect/2/original/cc/limitation.html)（2026年9月15日確認）。公式テンプレートには印刷位置が上下左右に最大約12pxずれる場合があると記載されています。実機の仕上がりはアップロード後のプレビューでも確認してください。

元画像 `desire.png` と `desire-back.png` は変更せず残しています。調整済み素材・使用プロンプトは [IMAGE_ASSETS.md](./IMAGE_ASSETS.md) を参照してください。画像生成は開発時のみで、公開サイトは静的ファイルとブラウザのCanvasだけで動作します。

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
