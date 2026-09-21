export type LineageKey =
  | "root" | "direct" | "honmoku" | "rokkaku" | "ichi" | "oudou" | "musashi" | "indep" | "capital";
export type EdgeKind = "direct" | "former" | "trained" | "disputed";
export type ShopStatus = "open" | "closed" | "main-closed";
export type Pref = "神奈川" | "東京" | "千葉";

export interface Shop {
  id: string;
  name: string;
  sub: string;
  pref: Pref;
  city: string;
  founded: number;
  approx?: boolean;
  parent: string | null;
  lineage: LineageKey;
  status: ShopStatus;
  edge: EdgeKind | null;
  note: string;
  // Google マップで検索する文字列（店名＋住所）。省略時は「店名 + sub または city」で組み立てる。
  // place ID は一度失効すると「一致する検索結果はありません」になるため使わない。
  mapQuery?: string;
}

/** 詳細パネルの「Google マップで開く」リンク。検索クエリ形式なので店舗が移転しても落ちない。 */
export function mapUrl(shop: Shop): string {
  const query = shop.mapQuery ?? `${shop.name} ${shop.sub || shop.city}`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export const LINEAGES: Record<LineageKey, { label: string; color: string }> = {
  root:    { label: "総本山",   color: "#F1E7D2" },
  direct:  { label: "直系",     color: "#D0402F" },
  honmoku: { label: "本牧家系", color: "#5B8BC0" },
  rokkaku: { label: "六角家系", color: "#86AE55" },
  ichi:    { label: "壱系",     color: "#E3B95A" },
  oudou:   { label: "王道家系", color: "#B58AD1" },
  musashi: { label: "武蔵家系", color: "#D39A66" },
  indep:   { label: "独立系",   color: "#E09A8E" },
  capital: { label: "資本系",   color: "#8E8577" },
};

export const EDGE_LABEL: Record<EdgeKind, string> = {
  direct: "直系（吉村家認定）",
  former: "元直系（認定を離脱）",
  trained: "修行・独立",
  disputed: "修行・独立（諸説あり）",
};

export const STATUS_LABEL: Record<ShopStatus, string> = {
  open: "営業中",
  closed: "閉店",
  "main-closed": "本店閉店・支店が継承",
};

export const PREFS: Pref[] = ["神奈川", "東京", "千葉"];
export const YEAR_MIN = 1974;
export const YEAR_MAX = 2026;

// 系譜は公開情報を編集したもの。approx=true の創業年は概算。
// mapQuery は現存する店舗を指す。本店閉店（main-closed）の店は暖簾を継承する店舗を指す。
// 多店舗ブランドは屋号のみを検索して全店舗が地図に出るようにする。
export const NODES: Shop[] = [
  { id: "yoshimura", name: "吉村家", sub: "横浜駅西口", pref: "神奈川", city: "横浜市西区", founded: 1974, parent: null, lineage: "root", status: "open", edge: null,
    note: "1974年、吉村実氏が新杉田に創業。豚骨醤油のスープに酒井製麺の太麺、ほうれん草と海苔、チャーシュー。屋号の「家」がそのまま「家系」の名の由来になった。1999年に横浜駅西口へ移転し、今も総本山として行列が絶えない。",
    mapQuery: "家系総本山 吉村家 横浜市西区南幸" },

  { id: "honmoku", name: "本牧家", sub: "本牧", pref: "神奈川", city: "横浜市中区", founded: 1985, parent: "yoshimura", lineage: "honmoku", status: "main-closed", edge: "trained",
    note: "吉村家の2号店として本牧に開店。店長だった神藤隆氏が独立して六角家を開き、本牧家自身も後に吉村家から独立した。本牧家系・六角家系という二大分流の源。",
    mapQuery: "本牧家 横須賀店 横須賀市本町3-33-3" }, // 本店閉店後は横須賀店が暖簾を継ぐ
  { id: "suzuki", name: "寿々喜家", sub: "上星川", pref: "神奈川", city: "横浜市保土ケ谷区", founded: 1990, parent: "honmoku", lineage: "honmoku", status: "open", edge: "trained",
    note: "本牧家出身。上星川の住宅街で長く愛される本牧家系の代表格。",
    mapQuery: "寿々喜家 本店 横浜市保土ケ谷区上星川2-3-1" },

  { id: "rokkaku", name: "六角家", sub: "六角橋", pref: "神奈川", city: "横浜市神奈川区", founded: 1988, parent: "honmoku", lineage: "rokkaku", status: "main-closed", edge: "trained",
    note: "本牧家の店長だった神藤隆氏が六角橋に開店。新横浜ラーメン博物館への出店で「家系」を全国区に押し上げた。本店は2017年に閉店し、戸塚の店が暖簾を守る。2025年に戸塚駅前のトツカーナモールへ移転した。",
    mapQuery: "ラーメン六角家 戸塚 トツカーナモール" }, // 旧・戸塚店（本店は2017年閉店）
  { id: "kaiichi", name: "介一家", sub: "山手", pref: "神奈川", city: "横浜市中区", founded: 1992, approx: true, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "trained",
    note: "六角家出身。まろやかなスープで六角家系の味を継ぐ。山手の本店を中心に数店を構える。",
    mapQuery: "介一家 山手 横浜市中区" },
  { id: "takasago", name: "たかさご家", sub: "日ノ出町", pref: "神奈川", city: "横浜市中区", founded: 1998, approx: true, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "trained",
    note: "六角家出身。横浜中心部で六角家系の味を伝える一軒。東京の家系に与えた影響も大きい。",
    mapQuery: "たかさご家 本店 横浜市中区日ノ出町1-17" },
  { id: "samurai", name: "侍", sub: "渋谷", pref: "東京", city: "渋谷区", founded: 2002, approx: true, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "disputed",
    note: "東京の家系を代表する一軒。系譜上は六角家の流れとされることが多いが、位置づけには諸説ある。現在は道玄坂に渋谷本店を構える。",
    mapQuery: "横浜家系らーめん侍 渋谷本店 渋谷区道玄坂2-6-6" },

  { id: "ichiroku", name: "壱六家", sub: "磯子", pref: "神奈川", city: "横浜市磯子区", founded: 1994, parent: "rokkaku", lineage: "ichi", status: "open", edge: "trained",
    note: "六角家出身。うずらの卵を載せる独自のスタイルで「壱系」と呼ばれる一派の源流となった。",
    mapQuery: "ラーメン壱六家 磯子本店 横浜市磯子区森2-2-7" },
  { id: "ichihachi", name: "壱八家", sub: "", pref: "神奈川", city: "横浜市", founded: 2001, approx: true, parent: "ichiroku", lineage: "ichi", status: "open", edge: "trained",
    note: "壱六家からの暖簾分け。うずら卵と甘めのスープが壱系の証。横浜を中心に複数店を展開する。",
    mapQuery: "横浜らーめん 壱八家" },
  { id: "ichinana", name: "壱七家", sub: "", pref: "神奈川", city: "横浜市", founded: 2003, approx: true, parent: "ichiroku", lineage: "ichi", status: "open", edge: "trained",
    note: "壱六家からの暖簾分け。壱系の番号付き屋号のひとつ。",
    mapQuery: "横浜家系ラーメン 壱七家" },

  { id: "musashi", name: "武蔵家", sub: "千葉", pref: "千葉", city: "千葉市中央区", founded: 1997, approx: true, parent: "rokkaku", lineage: "musashi", status: "open", edge: "disputed",
    note: "千葉発、東京に多店舗を広げた武蔵家系の源流。ライス無料の文化を東京に根付かせた。系譜上の位置づけには諸説ある。",
    mapQuery: "らーめん武蔵家 千葉本店 千葉市中央区道場北町317" },
  { id: "musashi-nakano", name: "武蔵家", sub: "新中野", pref: "東京", city: "中野区", founded: 2001, approx: true, parent: "musashi", lineage: "musashi", status: "open", edge: "trained",
    note: "武蔵家の東京進出の拠点。濃厚なスープと無料ライスで学生に支持される。",
    mapQuery: "横浜ラーメン 武蔵家 中野本店 中野区中央4-4-1" },
  { id: "budoka", name: "武道家", sub: "早稲田", pref: "東京", city: "新宿区", founded: 2005, approx: true, parent: "musashi", lineage: "musashi", status: "open", edge: "trained",
    note: "武蔵家出身。早稲田の学生街で圧倒的な支持を集め、「濃さ」で語られる東京家系の代名詞。",
    mapQuery: "横浜家系らーめん 武道家 本店 新宿区馬場下町" },
  { id: "budoka2", name: "武道家", sub: "吉祥寺", pref: "東京", city: "武蔵野市", founded: 2013, parent: "budoka", lineage: "musashi", status: "open", edge: "trained",
    note: "2013年に開いた武道家の2号店。家系激戦区の吉祥寺で本店譲りの濃厚なスープを出す。",
    mapQuery: "横浜家系らーめん 武道家 吉祥寺店 武蔵野市吉祥寺南町1-5-11" },

  { id: "kondo", name: "近藤家", sub: "川崎", pref: "神奈川", city: "川崎市川崎区", founded: 1988, approx: true, parent: "yoshimura", lineage: "indep", status: "open", edge: "trained",
    note: "吉村家出身。川崎で独自の道を歩む古参の一軒。",
    mapQuery: "ラーメン近藤家 川崎市川崎区昭和2-14-10" },

  { id: "sugita", name: "杉田家", sub: "新杉田", pref: "神奈川", city: "横浜市磯子区", founded: 1999, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "吉村家が横浜駅西口へ移転した跡地に、一番弟子の津村氏が開店。直系一号店とされ、創業の地で当時の味を守り続ける。",
    mapQuery: "ラーメン杉田家 本店 横浜市磯子区新杉田町3-5" },
  { id: "sugita-chiba", name: "杉田家", sub: "千葉店", pref: "千葉", city: "千葉市中央区", founded: 2016, approx: true, parent: "sugita", lineage: "direct", status: "open", edge: "direct",
    note: "杉田家の暖簾分け。千葉における吉村家直系の拠点。",
    mapQuery: "ラーメン杉田家 千葉祐光店 千葉市中央区" },
  { id: "kan2", name: "環２家", sub: "環状2号線", pref: "神奈川", city: "横浜市港南区", founded: 1998, approx: true, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "環状2号線沿いの直系店。ロードサイドで長く支持され、直系の中でも古参。",
    mapQuery: "ラーメン環2家 横浜市港南区下永谷3-3-21" },
  { id: "atsugi", name: "厚木家", sub: "本厚木", pref: "神奈川", city: "厚木市", founded: 2005, approx: true, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "県央・厚木に構える直系店。吉村実氏の次男が営む。",
    mapQuery: "ラーメン厚木家 厚木市妻田東2-25-11" },
  { id: "suehiro", name: "末廣家", sub: "白楽", pref: "神奈川", city: "横浜市神奈川区", founded: 2013, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "六角橋商店街の近く、白楽に開店した直系店。",
    mapQuery: "末廣家 横浜市神奈川区六角橋" },

  { id: "oudou", name: "王道家", sub: "柏", pref: "千葉", city: "柏市", founded: 2003, parent: "yoshimura", lineage: "oudou", status: "open", edge: "former",
    note: "清水裕正氏が吉村家で修行後、2003年に取手で創業。直系として認定されるも2019年に離脱し、柏へ移転。自家製麺を武器に独自の系譜を築いている。",
    mapQuery: "家系ラーメン 王道家 柏市明原1-7-26" },
  { id: "torakichi", name: "とらきち家", sub: "西神奈川", pref: "神奈川", city: "横浜市神奈川区", founded: 2011, approx: true, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "王道家出身。取手で創業し、横浜の東白楽を経て西神奈川へ移転。現在は「とらきち家 光」として営業する王道家系の看板店。",
    mapQuery: "とらきち家 光 横浜市神奈川区西神奈川3-1-1" },
  { id: "oudou-shirushi", name: "王道乃印", sub: "柏", pref: "千葉", city: "柏市", founded: 2019, approx: true, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "王道家の姉妹店。柏に王道家系の一角を形づくる。",
    mapQuery: "家系ラーメン 王道乃印 柏店 柏市柏3-6-16" },
  { id: "oudou-ishii", name: "王道 いしい", sub: "千葉", pref: "千葉", city: "千葉市中央区", founded: 2020, approx: true, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "王道家出身の店主による千葉市の店。",
    mapQuery: "家系ラーメン 王道 いしい 千葉市中央区浜野" },

  // 系図に載らない資本系（修行系譜に属さない）
  { id: "machida", name: "町田商店", sub: "町田", pref: "東京", city: "町田市", founded: 2008, parent: null, lineage: "capital", status: "open", edge: null,
    note: "ギフトホールディングスが展開するチェーン。修行の系譜には属さない「資本系」の代表格で、家系を全国に広めた。",
    mapQuery: "横浜家系ラーメン 町田商店 本店 町田市森野1-34-13" },
  { id: "konshin", name: "魂心家", sub: "", pref: "神奈川", city: "横浜市ほか", founded: 2010, approx: true, parent: null, lineage: "capital", status: "open", edge: null,
    note: "企業が展開する資本系。関東を中心に多店舗化。",
    mapQuery: "横浜家系ラーメン 魂心家" },
  { id: "ichikaku", name: "壱角家", sub: "", pref: "東京", city: "東京都ほか", founded: 2013, approx: true, parent: null, lineage: "capital", status: "open", edge: null,
    note: "企業が展開する資本系。都内の駅前に多い。",
    mapQuery: "横浜家系ラーメン 壱角家" },
];

export const SHOP_BY_ID = new Map(NODES.map((n) => [n.id, n]));
