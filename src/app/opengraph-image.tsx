import { ImageResponse } from "next/og";
import { LINEAGES, NODES } from "@/data/shops";
import { computeLayout } from "@/lib/layout";
import { loadOgFont } from "@/lib/og-font";
import { silhouette } from "@/lib/og";
import { SITE_NAME, SITE_URL } from "@/lib/site";

// 静的出力（output: "export"）でもビルド時に out/opengraph-image として書き出す
export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${SITE_NAME} — 吉村家から広がる系図`;

// globals.css の配色と合わせる。Satori は CSS 変数を読めないので値を直接書く
const BG = "#2B1B12", PAPER = "#F1E7D2", PAPER_DIM = "#B9A98E", PAPER_FAINT = "#7E6F5C";

// TODO(human): 画像の説明 1 行。サイトの立ち位置を決める文言なので宮田さんが書く。下は仮の文言
const TAGLINE = `吉村家から辿る ${NODES.length} 店の系譜`;

/** 系線と丸印だけの系図（影絵）。屋号は描かない。縮小されても形が読めるよう線を太めにする */
function Silhouette({ width, height }: { width: number; height: number }) {
  const R = 9; // 丸印の半径（画面の MARK より大きめ）
  const { marks, lines } = silhouette(computeLayout(NODES), { width, height, pad: R * 2 });
  return (
    <svg width={width} height={height} fill="none" strokeWidth={2.5}>
      {lines.map((l) => (
        <line key={l.id} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={l.lineage ? LINEAGES[l.lineage].color : PAPER_FAINT}
          strokeDasharray={l.dashed ? "5 5" : undefined} />
      ))}
      {marks.map((m) => {
        const color = LINEAGES[m.lineage].color;
        return (
          <g key={m.id}>
            {m.ring && <circle cx={m.x} cy={m.y} r={R + 6} stroke={color} strokeWidth={1.5}
              strokeDasharray={m.ring === "dashed" ? "3 3" : undefined} />}
            <circle cx={m.x} cy={m.y} r={R} fill={m.filled ? color : BG} stroke={color} />
          </g>
        );
      })}
    </svg>
  );
}

export default async function Image() {
  const host = SITE_URL.replace(/^https?:\/\//, "");
  const font = await loadOgFont(SITE_NAME + TAGLINE + host);
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center",
        background: BG, color: PAPER, fontFamily: "Yuji", padding: "36px 60px 32px" }}>
        <div style={{ position: "absolute", left: 40, top: 24, fontSize: 20, color: PAPER_FAINT, letterSpacing: "0.05em" }}>{host}</div>
        <Silhouette width={1080} height={340} />
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginTop: "auto" }}>
          <div style={{ fontSize: 84, letterSpacing: "0.12em", lineHeight: 1.1 }}>{SITE_NAME}</div>
          <div style={{ fontSize: 30, color: PAPER_DIM, letterSpacing: "0.2em", marginTop: 14 }}>{TAGLINE}</div>
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Yuji", data: font, weight: 400, style: "normal" }] },
  );
}
