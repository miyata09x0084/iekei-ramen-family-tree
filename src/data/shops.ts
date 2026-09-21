export type LineageKey =
  | "root" | "direct" | "honmoku" | "rokkaku" | "ichi" | "oudou" | "musashi" | "indep" | "capital";
export type EdgeKind = "direct" | "former" | "trained" | "disputed";
export type ShopStatus = "open" | "closed" | "main-closed";
export type Region = "関東" | "東海" | "関西";
export type Pref =
  | "神奈川" | "東京" | "千葉"
  | "静岡" | "愛知"
  | "京都" | "大阪" | "兵庫" | "奈良";

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

// 都道府県が増えると絞り込みチップが横に溢れるため、チップは地方単位で出す。
// 都道府県そのものは詳細パネルの所在地表示に残る。
export const PREF_REGION: Record<Pref, Region> = {
  神奈川: "関東", 東京: "関東", 千葉: "関東",
  静岡: "東海", 愛知: "東海",
  京都: "関西", 大阪: "関西", 兵庫: "関西", 奈良: "関西",
};
export const REGIONS: Region[] = ["関東", "東海", "関西"];

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
  { id: "kokorozashi", name: "志", sub: "小幡", pref: "愛知", city: "名古屋市守山区", founded: 2025, parent: "samurai", lineage: "rokkaku", status: "open", edge: "trained",
    note: "渋谷の侍で7年、福井の英で3年修行した中野太加志氏が、地元・名古屋で独立して開いた店。麺は吉村家と同じ大田区の酒井製麺から取り寄せる。名古屋に届いた六角家系の枝。",
    mapQuery: "横浜家系らーめん 志 名古屋市守山区小幡1-2-4" },

  { id: "kichijoji-musashiya", name: "武蔵家", sub: "吉祥寺", pref: "東京", city: "武蔵野市", founded: 1999, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "trained",
    note: "六角家出身の永井康介氏と、現店主の藤崎茂也氏が共同で開いた六角家の姉妹店。新中野の武蔵家とは系統が異なり、屋号が同じなのは偶然とされる。",
    mapQuery: "吉祥寺武蔵家 武蔵野市吉祥寺本町1-8-2" },
  { id: "dokutsuya", name: "洞くつ家", sub: "吉祥寺", pref: "東京", city: "武蔵野市", founded: 2003, parent: "kichijoji-musashiya", lineage: "rokkaku", status: "open", edge: "trained",
    note: "吉祥寺武蔵家を共同で開いた永井康介氏が独立して構えた店。現在は六角家の姉妹店の位置づけをこちらが継ぐ。朝から家系が食べられる一軒として知られる。",
    mapQuery: "ラーメン 洞くつ家 武蔵野市吉祥寺本町1-19-7" },
  { id: "kantetsuya", name: "貫徹家", sub: "静岡", pref: "静岡", city: "静岡市葵区", founded: 2019, parent: "dokutsuya", lineage: "rokkaku", status: "open", edge: "trained",
    note: "吉祥寺の洞くつ家出身の店主が静岡市の中心部に開いた店。豚骨と鶏ガラを自家で炊き、酒井製麺の中太麺を合わせる。",
    mapQuery: "家系ラーメン 貫徹家 静岡市葵区研屋町16" },

  { id: "kuramaeya", name: "蔵前家", sub: "浜松", pref: "静岡", city: "浜松市浜名区", founded: 2009, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "trained",
    note: "六角家で4年以上修行した袴田雄二氏が2001年に東京・浅草で創業し、2009年に浜松へ移した。2024年、創業者に指名されて新横浜ラーメン博物館の「六角家1994+」を任された。",
    mapQuery: "蔵前家 浜松市浜名区" },
  { id: "shikura", name: "紫蔵", sub: "平野神社前", pref: "京都", city: "京都市北区", founded: 2007, parent: "kuramaeya", lineage: "rokkaku", status: "open", edge: "disputed",
    note: "京都の家系のパイオニア。2007年に茶山で開業し、2011年に北区へ移った。修行元は六角家姉妹店の蔵前家出身とする説と、王道家で修行したとする説があり、位置づけには諸説ある。",
    mapQuery: "紫蔵 京都市北区平野宮本町" },

  { id: "yoshidaya", name: "吉田家", sub: "伊東", pref: "静岡", city: "伊東市", founded: 1993, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "disputed",
    note: "1993年創業。六角家の姉妹店的な存在とされ、六角家の味を東海・甲信越へ広げたラインの起点。ここから伊豆・三島へ独立した店が続く。位置づけには諸説ある。",
    mapQuery: "吉田家 本店 伊東市吉田753-3" },

  { id: "minatoya", name: "三七十家", sub: "中山手通", pref: "兵庫", city: "神戸市中央区", founded: 2010, parent: "kichijoji-musashiya", lineage: "rokkaku", status: "open", edge: "trained",
    note: "吉祥寺武蔵家で修行した店主が神戸に開いた店。関西では珍しい吉祥寺武蔵家の系譜で、平打ちの中太麺を使う。",
    mapQuery: "ラーメン 三七十家 神戸市中央区中山手通3-2-1" },

  { id: "ichiroku", name: "壱六家", sub: "磯子", pref: "神奈川", city: "横浜市磯子区", founded: 1994, parent: "rokkaku", lineage: "ichi", status: "open", edge: "trained",
    note: "六角家出身。うずらの卵を載せる独自のスタイルで「壱系」と呼ばれる一派の源流となった。",
    mapQuery: "ラーメン壱六家 磯子本店 横浜市磯子区森2-2-7" },
  { id: "ichihachi", name: "壱八家", sub: "", pref: "神奈川", city: "横浜市", founded: 2001, approx: true, parent: "ichiroku", lineage: "ichi", status: "open", edge: "trained",
    note: "壱六家からの暖簾分け。うずら卵と甘めのスープが壱系の証。横浜を中心に複数店を展開する。",
    mapQuery: "横浜らーめん 壱八家" },
  { id: "ichinana", name: "壱七家", sub: "", pref: "神奈川", city: "横浜市", founded: 2003, approx: true, parent: "ichiroku", lineage: "ichi", status: "open", edge: "trained",
    note: "壱六家からの暖簾分け。壱系の番号付き屋号のひとつ。",
    mapQuery: "横浜家系ラーメン 壱七家" },
  { id: "banraitei", name: "萬来亭", sub: "鳴海", pref: "愛知", city: "名古屋市緑区", founded: 2003, parent: "ichiroku", lineage: "ichi", status: "open", edge: "trained",
    note: "1998年に緑区で店を構えた後、横浜の壱六家で修業し、2003年に家系の店として再び開いた。名古屋の家系の草分け。",
    mapQuery: "萬来亭 名古屋市緑区作の山町230" },

  { id: "musashi-nakano", name: "武蔵家", sub: "新中野", pref: "東京", city: "中野区", founded: 1997, parent: "takasago", lineage: "musashi", status: "open", edge: "trained",
    note: "1997年、菅沼薫氏が新中野に開いた武蔵家系の本店。たかさご家からの独立で、系譜は 吉村家→六角家→たかさご家→武蔵家。濃厚なスープと無料ライスの文化を東京に根付かせ、ここから20店を超える支店と暖簾分けが生まれた。",
    mapQuery: "横浜ラーメン 武蔵家 中野本店 中野区中央4-4-1" },
  { id: "musashi", name: "武蔵家", sub: "千葉", pref: "千葉", city: "千葉市中央区", founded: 2003, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "武蔵家の千葉初進出店。千葉県内の武蔵家はいずれも新中野からの系譜にあたる。",
    mapQuery: "らーめん武蔵家 千葉本店 千葉市中央区道場北町317" },
  { id: "budoka", name: "武道家", sub: "早稲田", pref: "東京", city: "新宿区", founded: 2005, approx: true, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "武蔵家出身。早稲田の学生街で圧倒的な支持を集め、「濃さ」で語られる東京家系の代名詞。",
    mapQuery: "横浜家系らーめん 武道家 本店 新宿区馬場下町" },
  { id: "budoka2", name: "武道家", sub: "吉祥寺", pref: "東京", city: "武蔵野市", founded: 2013, parent: "budoka", lineage: "musashi", status: "open", edge: "trained",
    note: "2013年に開いた武道家の2号店。家系激戦区の吉祥寺で本店譲りの濃厚なスープを出す。",
    mapQuery: "横浜家系らーめん 武道家 吉祥寺店 武蔵野市吉祥寺南町1-5-11" },
  { id: "soranohoshi", name: "そらの星", sub: "千林大宮", pref: "大阪", city: "大阪市旭区", founded: 2009, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "大阪にまだ家系がほとんど無かった2009年、新中野の武蔵家で修業した店主が開いた。大阪の家系のパイオニア。",
    mapQuery: "そらの星 大阪市旭区" },
  { id: "kyodoya", name: "教道家", sub: "長瀬", pref: "大阪", city: "東大阪市", founded: 2011, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "中野の武蔵家の店長が2011年に開いた店。近畿大学の学生街で、関西に家系を伝えてきた一軒。",
    mapQuery: "横浜家系ラーメン 教道家 東大阪市長瀬" },
  { id: "musouya", name: "武双家", sub: "関大前", pref: "大阪", city: "吹田市", founded: 2011, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "2011年1月に関大前で開いた、中野の武蔵家の関西進出1号店。関西大学の学生街でライス無料の文化を根付かせた。",
    mapQuery: "らーめん武双家 吹田市千里山東" },

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

  { id: "tagami", name: "田上家", sub: "弘明寺", pref: "神奈川", city: "横浜市南区", founded: 2014, parent: "oudou", lineage: "oudou", status: "open", edge: "disputed",
    note: "2014年に弘明寺で開店。王道家の系譜とする説と、王道家系ではなく吉村家の影響を強く受けたとする説があり、位置づけには諸説ある。ここから斎藤家が生まれた。",
    mapQuery: "田上家 横浜市南区弘明寺町" },
  { id: "saito", name: "斎藤家", sub: "根岸", pref: "神奈川", city: "横浜市", founded: 2022, parent: "tagami", lineage: "oudou", status: "open", edge: "trained",
    note: "田上家出身の店主が2022年に根岸で開いた店。短期間で暖簾分けを重ね、静岡と京都へ枝を伸ばした。",
    mapQuery: "横浜ラーメン 斎藤家 根岸" },
  { id: "saito-shuzenji", name: "斎藤家", sub: "修善寺店", pref: "静岡", city: "伊豆市", founded: 2024, parent: "saito", lineage: "oudou", status: "open", edge: "trained",
    note: "2024年4月、斎藤家で修行した女性店主が伊豆に開いた、斎藤家として初の暖簾分け。伊豆に本格的な家系が届いた。",
    mapQuery: "横浜ラーメン斎藤家 修善寺店 伊豆市瓜生野90-5" },
  { id: "saito-ichijoji", name: "斎藤家", sub: "一乗寺店", pref: "京都", city: "京都市左京区", founded: 2024, parent: "saito", lineage: "oudou", status: "open", edge: "trained",
    note: "2024年7月、ラーメン激戦区の一乗寺に開いた斎藤家の京都店。吉村家→王道家→田上家→斎藤家と辿れる系譜が関西に届いた。",
    mapQuery: "家系ラーメン 斎藤家 一乗寺店 京都市左京区高野泉町6-100" },

  { id: "gadouya", name: "我道家", sub: "天理", pref: "奈良", city: "天理市", founded: 2022, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "2022年1月、柏の王道家・清水裕正氏に師事した品井雄介氏が天理に開いた、西日本の王道家直系1号店。「IEKEI KANSAI」を掲げ、関西に本場の家系を持ち込んだ。",
    mapQuery: "IEKEI KANSAI 王道家直系 我道家 天理市中町218-1" },
  { id: "gadouya-osaka", name: "我道家", sub: "OSAKA本店", pref: "大阪", city: "大阪市浪速区", founded: 2024, parent: "gadouya", lineage: "oudou", status: "open", edge: "trained",
    note: "2024年12月、天理の我道家が大阪へ進出して開いた店。JR難波からすぐ、なんばウォークからも入れる。",
    mapQuery: "王道家直系 我道家 OSAKA本店 大阪市浪速区湊町" },

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
