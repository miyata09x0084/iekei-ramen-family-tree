import { ImageResponse } from "next/og";
import { LINEAGES, NODES, type EdgeKind } from "@/data/shops";
import { computeLayout } from "@/lib/layout";
import { loadOgFont } from "@/lib/og-font";
import { silhouette } from "@/lib/og";
import { OG_IMAGE, SITE_NAME, SITE_URL, siteTagline } from "@/lib/site";

// 静的出力でもビルド時に out/og.png として書き出す（sitemap.ts / robots.ts も同じ指定）。
// 規約ファイルの opengraph-image.tsx は拡張子なしで出力され、静的ホスティングが image/png で
// 返す保証がないので、拡張子付きのパスを持つ route にしている。タグは layout.tsx で指定する
export const dynamic = "force-static";

// globals.css の配色と合わせる。Satori は CSS 変数を読めないので値を直接書く
const BG = "#2B1B12", PAPER = "#F1E7D2", PAPER_DIM = "#B9A98E", PAPER_FAINT = "#7E6F5C";

/** 画像内の寸法（px）。カードは小さく表示されるので、画面の系図より丸印と線を大きくする */
const TREE_W = 1080;  // 影絵の幅
const TREE_H = 340;   // 影絵の高さ
const MARK_R = 9;     // 丸印の半径
const RING_GAP = 6;   // 丸印と直系の外輪の間
const TITLE_SIZE = 84;
const TAGLINE_SIZE = 30;
const HOST_SIZE = 20;

/** 系線の点線。画面（globals.css の .link.disputed / .link.inspired）と同じ区別を、線の太さに合わせて広げる */
const DASH: Partial<Record<EdgeKind, string>> = { disputed: "6 6", inspired: "2 7" };

/** 系線と丸印だけの系図（影絵）。屋号は描かない */
function Silhouette() {
  const { marks, lines } = silhouette(computeLayout(NODES), { width: TREE_W, height: TREE_H, pad: MARK_R + RING_GAP + 2 });
  return (
    <svg width={TREE_W} height={TREE_H} fill="none" strokeWidth={2.5}>
      {lines.map((l) => (
        <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={l.lineage ? LINEAGES[l.lineage].color : PAPER_FAINT}
          strokeDasharray={l.edge ? DASH[l.edge] : undefined} />
      ))}
      {marks.map((m) => {
        const color = LINEAGES[m.lineage].color;
        return (
          <g key={m.id}>
            {m.ring && <circle cx={m.x} cy={m.y} r={MARK_R + RING_GAP} stroke={color} strokeWidth={1.5}
              strokeDasharray={m.ring === "dashed" ? "3 3" : undefined} />}
            <circle cx={m.x} cy={m.y} r={MARK_R} fill={m.filled ? color : BG} stroke={color} />
          </g>
        );
      })}
    </svg>
  );
}

export async function GET() {
  const tagline = siteTagline();
  // 画像だけが切り取られて出回っても出所を辿れるよう、隅にホスト名を入れる
  const host = new URL(SITE_URL).host;
  const font = await loadOgFont(SITE_NAME + tagline + host);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center",
        background: BG, color: PAPER, fontFamily: "Yuji", padding: "64px 60px 32px" }}>
        <div style={{ position: "absolute", left: 40, top: 24, fontSize: HOST_SIZE, color: PAPER_FAINT, letterSpacing: "0.05em" }}>{host}</div>
        <Silhouette />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "auto" }}>
          <div style={{ fontSize: TITLE_SIZE, letterSpacing: "0.12em", lineHeight: 1.1 }}>{SITE_NAME}</div>
          <div style={{ fontSize: TAGLINE_SIZE, color: PAPER_DIM, letterSpacing: "0.2em", marginTop: 14 }}>{tagline}</div>
        </div>
      </div>
    ),
    { width: OG_IMAGE.width, height: OG_IMAGE.height, fonts: [{ name: "Yuji", data: font, weight: 400, style: "normal" }] },
  );
}
