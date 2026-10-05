/**
 * OGP 画像に使う筆文字（Yuji Syuku）を Google Fonts から取る。ビルド時にだけ呼ばれる。
 * `text=` で画像に出る文字だけのサブセットにし、数 MB のフォントをリポジトリに置かずに済ませる。
 * 画面側は next/font/google が同じフォントを取っているので、ビルドの依存先は増えない。
 */
export async function loadOgFont(text: string): Promise<ArrayBuffer> {
  const chars = [...new Set(text)].join("");
  const cssUrl = `https://fonts.googleapis.com/css2?family=Yuji+Syuku&text=${encodeURIComponent(chars)}`;
  const css = await (await fetch(cssUrl)).text();
  // Satori は woff2 を読めないので、UA を名乗らずに取れる ttf/otf の URL を使う
  const fontUrl = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!fontUrl) throw new Error(`OGP 用フォントの URL が取れない: ${cssUrl}`);
  const res = await fetch(fontUrl);
  if (!res.ok) throw new Error(`OGP 用フォントの取得に失敗 (${res.status}): ${fontUrl}`);
  return res.arrayBuffer();
}
