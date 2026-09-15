# カードコネクト用の画像素材

2026-09-15、Codex内蔵の画像生成（built-in imagegen、参照画像の編集モード）で調整しました。元画像は上書きしていません。

- 表面：[desire-cardconnect.png](./desire-cardconnect.png)。参照元：`desire.png`。
- 裏面：[desire-back-cardconnect.png](./desire-back-cardconnect.png)。参照元：`desire-back.png`。
- 目的：元の白黒の絵柄と金色のロゴを維持し、2072:1328の横向きカード比率へ再構成。外側の余白・白帯は追加しません。
- 表面と裏面はサイトの高品質Canvasで2072×1328pxの不透明sRGB PNGへ正規化します。裏面のリポジトリ素材も、この処理で作った2072×1328px版です。外側の余白は追加していません。生成素材そのものではなく、サイトの保存ボタンから印刷用ファイルを取得してください。
- 開発時に表裏の生成画像を目視確認。実機での印刷結果は未検証です。

追加の高画質化生成編集も試行しましたが、画像生成サービスの使用上限（HTTP 429）に達したため新しい生成結果は採用していません。既に生成済みの裏面を高品質Canvasで再サンプリングし、最終版へ反映しています。

## 表面のプロンプト

```text
Use case: precise-object-edit.
Asset type: full-bleed, flat front-side background of a landscape printable Desire Card.
Input image 1: EDIT TARGET, the existing blank front-side card image.
Primary request: Adapt this exact design to a landscape 2072:1328 aspect ratio (approximately 1.56:1) for Card Connect printing. Recompose/extend the geometric artwork to fill the entire canvas edge to edge. Output a single flat high-resolution card face, preferably 2072 by 1328 pixels.
Preserve: the large completely plain white writing area, the original solid black top and right angular bands, the diagonal black corner connections, and the thin gray L-shaped line along the left and bottom of the writing area. Keep the same restrained black/white/gray visual identity and sharp straight geometry.
Change only the aspect ratio and framing needed to fit the new dimensions. Keep the white writing area clean for user-entered text. Extend the existing black-and-white artwork all the way to the image edges.
Absolutely no added outer margin, no padding, no letterboxing, no white border outside the existing artwork, no rounded card cutout, no crop marks, no perspective or mockup, no shadows, no textures, no new decorations. Do not add any text, numbers, logos, signature, watermark, or DONE stamp. All pixels opaque.
```

## 裏面のプロンプト

```text
Use case: precise-object-edit.
Asset type: full-bleed, flat back-side background of a landscape printable Desire Card.
Input image 1: EDIT TARGET, the existing back-side card image.
Primary request: Adapt this exact design to a landscape 2072:1328 aspect ratio (approximately 1.56:1) for Card Connect printing. Recompose/extend the artwork to fill the entire canvas edge to edge. Output a single flat high-resolution card face, preferably 2072 by 1328 pixels.
Preserve the original design: black upper-left area, white lower-right area separated by the same diagonal direction; the fine muted-gold ornamental rectangular frame with stepped corners; the central gold crown emblem and large DGP lettering and exact small text "DESIRE GRAND PRIX". Preserve the logo's original lettering shapes, proportions and placement centered in the composition. Do not redesign, mirror, rotate or embellish the logo. Keep straight lines straight.
Change only the framing and aspect ratio needed for the new dimensions. Keep the existing ornamental frame inside the artwork, and extend the original black-and-white artwork all the way to the image edges.
Absolutely no ADDED outer margin, no padding, no letterboxing, no white border outside the existing artwork, no rounded card cutout, no crop marks, no perspective or mockup, no shadows, no textures, no new decorations. Do not add any new text, signature, watermark, or DONE stamp. All pixels opaque.
```
