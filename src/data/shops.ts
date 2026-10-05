import { assertShopsValid } from "@/lib/validate";

export type LineageKey =
  | "root" | "direct" | "honmoku" | "rokkaku" | "ichi" | "oudou" | "musashi" | "indep" | "capital";
export type EdgeKind = "direct" | "former" | "trained" | "disputed" | "inspired";
export type ShopStatus = "open" | "closed" | "main-closed";
export type Pref = "神奈川" | "東京" | "千葉";

/** 出典。店の師匠・創業年・状態などの根拠として示す公開情報。URL は実際に開けることを確認したものだけを載せる */
export interface Source {
  // 媒体名＋ページ名。例: "Wikipedia「吉村家」"、"吉村家 公式サイト「直系店舗」"
  title: string;
  // http(s) で始まる URL。validate.ts が検査する。https が証明書不一致で開けない公式サイトだけ http にする
  url: string;
  // この出典が何を裏付けるか（任意）。例: "創業年・師匠"
  note?: string;
}

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
  // 出典。1 件以上が必須（validate.ts が検査する）
  sources: Source[];
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
  inspired: "影響を受けて開店（師弟関係なし）",
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
    note: "1974年、吉村実氏が新杉田に創業。豚骨醤油のスープに酒井製麺の太麺、ほうれん草と海苔、チャーシュー。屋号の「家」がそのまま「家系」の名の由来になった。1999年に横浜駅西口へ移転し、現在は同じ西口の岡野に店を構え、総本山として行列が絶えない。",
    sources: [
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", note: "創業年・移転・所在地" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", note: "創業年・家系の由来" },
    ],
    mapQuery: "家系総本山 吉村家 横浜市西区岡野" },

  { id: "honmoku", name: "本牧家", sub: "本牧", pref: "神奈川", city: "横浜市中区", founded: 1986, parent: "yoshimura", lineage: "honmoku", status: "main-closed", edge: "trained",
    note: "1986年、吉村家の2号店として本牧に開店。店長だった神藤隆氏が独立して六角家を開き、本牧家自身も後に吉村家から独立した。本牧家系・六角家系という二大分流の源。本店は港南区へ移った後、2023年に閉店し、横須賀店が暖簾を継ぐ。",
    sources: [
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", note: "師匠・創業年" },
      { title: "ブログ「本牧家 本店【2023年5月7日で閉店】」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12801099357.html", note: "創業年・本店閉店" },
    ],
    mapQuery: "本牧家 横須賀店 横須賀市本町3-33-3" }, // 本店閉店後は横須賀店が暖簾を継ぐ
  { id: "suzuki", name: "寿々喜家", sub: "上星川", pref: "神奈川", city: "横浜市保土ケ谷区", founded: 1990, parent: "honmoku", lineage: "honmoku", status: "open", edge: "trained",
    note: "本牧家出身。1990年創業。上星川の住宅街で長く愛される本牧家系の代表格。正式な表記は「寿々㐂家」。",
    sources: [
      { title: "家系ラーメンマン「寿々㐂家＠上星川」", url: "https://iekei-ramenman.hatenablog.com/entry/2019/09/24/170000", note: "師匠・創業年" },
      { title: "横浜ウォッチャー「上星川の家系ラーメン 寿々㐂家」", url: "https://travelyokohama.jp/entry/iekei-ramen-suzukiya-20250217", note: "創業年・系統" },
    ],
    mapQuery: "寿々喜家 本店 横浜市保土ケ谷区上星川2-3-1" },

  { id: "rokkaku", name: "六角家", sub: "六角橋", pref: "神奈川", city: "横浜市神奈川区", founded: 1988, parent: "honmoku", lineage: "rokkaku", status: "main-closed", edge: "trained",
    note: "本牧家の店長だった神藤隆氏が六角橋に開店。新横浜ラーメン博物館への出店で「家系」を全国区に押し上げた。本店は2017年に閉店し、戸塚の店が暖簾を守る。2025年に戸塚駅前のトツカーナモールへ移転した。",
    sources: [
      { title: "Wikipedia「六角家 (ラーメン店)」", url: "https://ja.wikipedia.org/wiki/六角家_(ラーメン店)", note: "師匠・創業年・本店閉店・移転" },
      { title: "ASCII.jp「あの銘店をもう一度がついにフィナーレ!! 大トリは横浜「六角家1994+」」", url: "https://ascii.jp/elem/000/004/193/4193163/", note: "師匠・創業年" },
    ],
    mapQuery: "ラーメン六角家 戸塚 トツカーナモール" }, // 旧・戸塚店（本店は2017年閉店）
  { id: "kaiichi", name: "介一家", sub: "山手", pref: "神奈川", city: "横浜市中区", founded: 1988, approx: true, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "trained",
    note: "本牧家・六角家を経た店主らが1988年頃に山手で立ち上げた。まろやかなスープで六角家系の味を継ぎ、山手の本店を中心に数店を構える。",
    sources: [
      { title: "家系ラーメンマン「1988年オープンの老舗家系ラーメン店 介一家 山手店」", url: "https://iekei-ramenman.hatenablog.com/entry/sukeichiya-yamate", note: "師匠・創業年" },
      { title: "ブログ「介一家 山手店＠山手」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12850367560.html", note: "師匠・創業年" },
    ],
    mapQuery: "介一家 山手 横浜市中区" },
  { id: "takasago", name: "たかさご家", sub: "日ノ出町", pref: "神奈川", city: "横浜市中区", founded: 1992, approx: true, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "disputed",
    note: "1992年頃、南区高砂町で創業し、のち日ノ出町へ。立ち上げに六角家出身の海添氏が関わったことから六角家系に置くが、店主自身は六角家で修行しておらず、位置づけには諸説ある。町田家を通じて東京の家系（侍など）に与えた影響も大きい。",
    sources: [
      { title: "家系ラーメンマン「日ノ出町の老舗家系 たかさご家 本店」", url: "https://iekei-ramenman.hatenablog.com/entry/takasagoya-honten20210403", note: "創業年・創業地・六角家との関係" },
      { title: "ブログ「たかさご家 本店＠日ノ出町」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12791610620.html", note: "創業年・創業地" },
      { title: "食べログ口コミ「たかさご家 本店 家系Vol.95-2」", url: "https://tabelog.com/kanagawa/A1401/A140102/14003538/dtlrvwlst/B69818078/", note: "店主は六角家で修行していないという説" },
    ],
    mapQuery: "たかさご家 本店 横浜市中区日ノ出町1-17" },
  { id: "machidaya", name: "町田家", sub: "町田", pref: "東京", city: "町田市", founded: 1996, parent: "takasago", lineage: "rokkaku", status: "open", edge: "trained",
    note: "たかさご家出身の店主が1996年4月に町田駅前で開店。六角家系の味を東京に持ち込んだ店で、渋谷の侍を輩出した。町田商店（資本系）とは別の店。",
    sources: [
      { title: "食べログ「ラーメン 町田家 町田本店」", url: "https://tabelog.com/tokyo/A1327/A132701/13010323/", note: "開店日・所在地" },
      { title: "ASCII.jp「都内トップクラスの家系ラーメン「侍 池尻店」」", url: "https://ascii.jp/elem/000/004/145/4145926/", note: "たかさご家からの系譜" },
      { title: "家系ラーメンマン「創業25年！町田家本店」", url: "https://iekei-ramenman.hatenablog.com/entry/machidaya_honten2021", note: "師匠・創業年" },
    ],
    mapQuery: "ラーメン 町田家 町田本店 町田市原町田3-7-2" },
  { id: "samurai", name: "侍", sub: "渋谷", pref: "東京", city: "渋谷区", founded: 2005, parent: "machidaya", lineage: "rokkaku", status: "open", edge: "trained",
    note: "町田家で修行した森真人氏が2005年に池尻で創業。2009年に渋谷本店を開き、2021年に道玄坂へ移転した。東京の家系を代表する一軒。",
    sources: [
      { title: "ASCII.jp「都内トップクラスの家系ラーメン「侍 池尻店」」", url: "https://ascii.jp/elem/000/004/145/4145926/", note: "師匠・創業年・系譜" },
      { title: "ブログ「横浜家系ラーメン侍 池尻店＠駒場東大前」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12841559343.html", note: "開店日" },
      { title: "Retty「横浜家系らーめん侍 渋谷本店」", url: "https://retty.me/restaurant/100001590194/", note: "渋谷本店の開店と移転" },
    ],
    mapQuery: "横浜家系らーめん侍 渋谷本店 渋谷区道玄坂2-6-6" },

  { id: "ichiroku", name: "壱六家", sub: "磯子", pref: "神奈川", city: "横浜市磯子区", founded: 1992, parent: "yoshimura", lineage: "ichi", status: "open", edge: "inspired",
    note: "1992年、吉村家のようなラーメン店を作ろうと磯子で開店。吉村家やその弟子の店で修行した経歴はなく、影響を受けて独自に始めた一軒。うずらの卵を載せるスタイルで「壱系」と呼ばれる一派の源流となった。",
    sources: [
      { title: "ASOBUILD「こだわりの味を守り抜く。家系ラーメン「壱六家」に迫る！」", url: "https://asobuild.com/news/3398/", note: "創業年・吉村家との関係" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", note: "吉村家に属さず独自開店・壱系" },
      { title: "はまれぽ.com「家系一大勢力“壱系”の全貌が明かされる！？」", url: "https://hamarepo.com/story.php?page_no=1&story_id=2328", note: "創業年・所在地" },
    ],
    mapQuery: "ラーメン壱六家 磯子本店 横浜市磯子区森2-2-7" },
  { id: "ichihachi", name: "壱八家", sub: "東戸塚", pref: "神奈川", city: "横浜市戸塚区", founded: 1999, parent: "ichiroku", lineage: "ichi", status: "open", edge: "trained",
    note: "1999年、壱六家のノウハウを学んで東戸塚で開店。屋号は壱六家の「壱」と運営会社エイトの「八」から。うずら卵と甘めのスープが壱系の証で、横浜を中心に複数店を展開する。",
    sources: [
      { title: "株式会社エイト 公式サイト「History 私たちの歴史」", url: "https://eight-8.co.jp/about_history.html", note: "創業年・創業地" },
      { title: "株式会社エイト 公式 note「はじめまして 横浜らーめん壱八家です」", url: "https://note.com/kodawari_eight/n/n0f9f952809ed", note: "師匠・屋号の由来" },
    ],
    mapQuery: "壱八家 東戸塚本店 横浜市戸塚区品濃町515-1" },
  { id: "ichinana", name: "壱七家", sub: "立川", pref: "東京", city: "立川市", founded: 2008, parent: "ichiroku", lineage: "ichi", status: "open", edge: "disputed",
    note: "2008年、立川で開店。魂心家と同じ株式会社トイダックが運営する。壱六家の暖簾分けとされることが多いが、師弟関係を示す公式・報道の記述は見つかっておらず、位置づけには諸説ある。",
    sources: [
      { title: "Retty「横浜家系ラーメン 立川 壱七家」", url: "https://retty.me/area/PRE13/ARE3/SUB301/100000730898/", note: "創業年・所在地" },
      { title: "家系ラーメンマン「壱六家の暖簾分け」", url: "https://iekei-ramenman.hatenablog.com/entry/2019/09/08/180000", note: "壱六家の暖簾分けとする説" },
      { title: "Yahoo!マップ「立川 壱七家」", url: "https://map.yahoo.co.jp/v3/place/1Y4BkbKGlQA", note: "営業状況・魂心家の姉妹店" },
    ],
    mapQuery: "横浜家系ラーメン 立川 壱七家 立川市柴崎町3-1-9" },

  { id: "musashi-nakano", name: "武蔵家", sub: "新中野", pref: "東京", city: "中野区", founded: 1997, parent: "takasago", lineage: "musashi", status: "open", edge: "trained",
    note: "たかさご家出身の店主が1997年に新中野で創業。武蔵家系の本店で、濃厚なスープと無料ライスを東京に根付かせ、暖簾分けは約90店に及ぶ。",
    sources: [
      { title: "さんたつ by 散歩の達人「武蔵家 中野本店」", url: "https://san-tatsu.jp/supporter/reports/1771/", note: "師匠・創業年" },
      { title: "家系ラーメンマン「1997年創業！武蔵家中野本店」", url: "https://iekei-ramenman.hatenablog.com/entry/musashiya_nakanohonten", note: "師匠・創業年・系譜" },
      { title: "葛飾経済新聞「葛飾・金町に『ラーメン三浦家』 武蔵家総大将が地元に凱旋出店」", url: "https://katsushika.keizai.biz/headline/1704/", note: "暖簾分けの規模" },
    ],
    mapQuery: "横浜ラーメン 武蔵家 中野本店 中野区中央4-4-1" },
  { id: "musashi", name: "武蔵家", sub: "千葉", pref: "千葉", city: "千葉市中央区", founded: 2003, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "新中野の武蔵家が2003年に出した千葉1号店。ここから千葉県内に暖簾分けが広がった。",
    sources: [
      { title: "iekei.jp「武蔵家 千葉本店」", url: "https://iekei.jp/shop/musashiya-chiba", note: "師匠・創業年・系譜" },
      { title: "食べログ「武蔵家 千葉本店」", url: "https://tabelog.com/en/chiba/A1201/A120101/12000921/", note: "開店日" },
    ],
    mapQuery: "らーめん武蔵家 千葉本店 千葉市中央区道場北町317" },
  { id: "budoka", name: "武道家", sub: "早稲田", pref: "東京", city: "新宿区", founded: 2006, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "新中野の武蔵家で修行した菊地輝氏が2006年に開店。早稲田の学生街で圧倒的な支持を集め、「濃さ」で語られる東京家系の代名詞。",
    sources: [
      { title: "高田馬場経済新聞「早大近くの家系ラーメン『武道家』が20周年」", url: "https://takadanobaba.keizai.biz/headline/1659/", note: "師匠・創業年" },
      { title: "高田馬場経済新聞「早大近くのラーメン店『武道家』が15周年」", url: "https://takadanobaba.keizai.biz/headline/664/", note: "師匠・創業年" },
    ],
    mapQuery: "横浜家系らーめん 武道家 本店 新宿区馬場下町" },
  { id: "budoka2", name: "武道家", sub: "吉祥寺", pref: "東京", city: "武蔵野市", founded: 2013, parent: "budoka", lineage: "musashi", status: "open", edge: "trained",
    note: "2013年に開いた武道家の2号店。家系激戦区の吉祥寺で本店譲りの濃厚なスープを出す。",
    sources: [
      { title: "さんたつ by 散歩の達人「家系激戦区の吉祥寺にある『武道家 吉祥寺店』」", url: "https://san-tatsu.jp/articles/232841/", note: "師匠・創業年" },
      { title: "食べログ「武道家 吉祥寺店」", url: "https://tabelog.com/en/tokyo/A1320/A132001/13159783/", note: "開店日・所在地" },
    ],
    mapQuery: "横浜家系らーめん 武道家 吉祥寺店 武蔵野市吉祥寺南町1-5-11" },

  { id: "kondo", name: "近藤家", sub: "北山田", pref: "神奈川", city: "横浜市都筑区", founded: 1992, parent: "rokkaku", lineage: "indep", status: "open", edge: "disputed",
    note: "本牧家・六角家に在籍した近藤健一氏が1992年に北山田で開店。六角家からの独立とする記述と本牧家・六角家の両方を挙げる記述があり、師匠の置き方には諸説ある。1997年には川崎店も開き、横浜北部で独自の道を歩む古参。",
    sources: [
      { title: "Yahoo!ニュース エキスパート「３０年以上、家系ラーメンの礎を築いたレジェンド店に行ってみた！！【家系】」", url: "https://news.yahoo.co.jp/expert/articles/03bbb3f6a018e69fc71d21d2998229bf3463f0aa", note: "創業年・店主・川崎店" },
      { title: "ラーメンデータベース「近藤家 本店」", url: "https://ramendb.supleks.jp/s/2488.html", note: "創業年・六角家との関係" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", note: "本牧家・六角家との関係" },
    ],
    mapQuery: "ラーメン近藤家 本店 横浜市都筑区北山田1-1-39" },

  { id: "sugita", name: "杉田家", sub: "新杉田", pref: "神奈川", city: "横浜市磯子区", founded: 1999, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "吉村家が横浜駅西口へ移転した跡地に、一番弟子の津村進氏が1999年に開店。直系1号店で、創業の地で当時の味を守り続ける。",
    sources: [
      { title: "吉村家 公式サイト「直系店舗のご案内」", url: "http://ieke1.com/source/yosimuraya/chokei.html", note: "直系認定" },
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", note: "師匠・創業年・直系1号店" },
      { title: "ラーメン杉田家 公式サイト「家系について」", url: "https://sugitaya.com/iekei/", note: "直系1号店" },
    ],
    mapQuery: "ラーメン杉田家 本店 横浜市磯子区新杉田町3-5" },
  { id: "sugita-chiba", name: "杉田家", sub: "千葉店", pref: "千葉", city: "千葉市中央区", founded: 2011, parent: "sugita", lineage: "direct", status: "open", edge: "direct",
    note: "2011年に開いた杉田家の2号店。店主は津村進氏の長男・津村文博氏。千葉における吉村家直系の拠点。",
    sources: [
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", note: "創業年・店主" },
      { title: "ラーメンデータベース「杉田家 千葉祐光店」", url: "https://ramendb.supleks.jp/s/31049.html", note: "開店日・直系" },
    ],
    mapQuery: "ラーメン杉田家 千葉祐光店 千葉市中央区祐光4-17-7" },
  { id: "kan2", name: "環２家", sub: "環状2号線", pref: "神奈川", city: "横浜市港南区", founded: 2000, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "2000年12月、直系2号店として環状2号線沿いの下永谷に開店。2015年に経営が変わって直系を離れたが、2021年5月に直系へ復帰した。",
    sources: [
      { title: "ラーメンデータベース「環2家」", url: "https://ramendb.supleks.jp/s/1614.html", note: "開店日・直系の離脱と復帰" },
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", note: "直系の離脱と復帰" },
      { title: "note「時系列で追う家系ラーメンの歴史」", url: "https://note.com/3almon/n/nd016f1274867", note: "師匠・創業年" },
    ],
    mapQuery: "ラーメン環2家 横浜市港南区下永谷3-3-21" },
  { id: "atsugi", name: "厚木家", sub: "本厚木", pref: "神奈川", city: "厚木市", founded: 2005, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "2005年11月開業。県央・厚木に構える直系店で、吉村実氏の次男・吉村政紀氏が営む。",
    sources: [
      { title: "吉村家 公式サイト「直系店舗のご案内」", url: "http://ieke1.com/source/yosimuraya/chokei.html", note: "直系認定・所在地" },
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", note: "創業年・店主" },
    ],
    mapQuery: "ラーメン厚木家 厚木市妻田東2-25-11" },
  { id: "suehiro", name: "末廣家", sub: "白楽", pref: "神奈川", city: "横浜市神奈川区", founded: 2013, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "2013年7月、六角橋商店街の近くの白楽に開店した直系店。店主は末廣良信氏。",
    sources: [
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", note: "創業年・店主・直系" },
      { title: "食べログ「ラーメン 末廣家」", url: "https://tabelog.com/kanagawa/A1401/A140205/14051496/", note: "開店日・直系" },
    ],
    mapQuery: "末廣家 横浜市神奈川区六角橋1-14-7" },

  { id: "oudou", name: "王道家", sub: "柏", pref: "千葉", city: "柏市", founded: 2003, parent: "yoshimura", lineage: "oudou", status: "open", edge: "former",
    note: "清水裕正氏が吉村家で修行後、2003年に柏で創業。直系として認定されるも2011年に離脱。2017年にビルの老朽化で取手へ移り、2019年10月に柏へ戻った。自家製麺を武器に独自の系譜を築いている。",
    sources: [
      { title: "Wikipedia「王道家」", url: "https://ja.wikipedia.org/wiki/王道家", note: "師匠・創業年・直系の離脱・移転" },
      { title: "ASCII.jp「読むだけで美味しいラーメン『物語』第14回」", url: "https://ascii.jp/elem/000/004/013/4013189/", note: "師匠・創業年・直系の離脱" },
      { title: "王道家 公式ブログ「柏 王道家オープン！」", url: "https://oudouya.com/2019/09/14/kashiwa-open/", note: "柏への再移転" },
    ],
    mapQuery: "家系ラーメン 王道家 柏市明原1-7-26" },
  { id: "torakichi", name: "とらきち家", sub: "東白楽", pref: "神奈川", city: "横浜市神奈川区", founded: 2014, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "王道家出身。2014年に横浜・東白楽で創業した王道家公認店。2024年に本家は平塚へ移り、東白楽の店は弟子が「とらきち家 光」として継いでいる。",
    sources: [
      { title: "食べログ「家系ラーメン とらきち家（東白楽）」", url: "https://tabelog.com/kanagawa/A1401/A140205/14053454/", note: "開店日・王道家公認" },
      { title: "王道家 公式サイト「グループ店舗情報」", url: "https://oudouya.com/shop-info/", note: "師匠" },
      { title: "ラーメンデータベース「家系ラーメン とらきち家」", url: "https://ramendb.supleks.jp/s/72495.html", note: "開店日・平塚への移転" },
    ],
    mapQuery: "とらきち家 光 横浜市神奈川区西神奈川3-1-1" },
  { id: "oudou-shirushi", name: "王道乃印", sub: "柏", pref: "千葉", city: "柏市", founded: 2023, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "王道家グループが2023年12月に柏駅東口で始めた姉妹ブランド。ここでの研修を経て他地域にも店が広がる。",
    sources: [
      { title: "ラーメンデータベース「家系ラーメン 王道乃印 柏店」", url: "https://ramendb.supleks.jp/s/154145.html", note: "開店日・所在地" },
      { title: "PR TIMES「王道家系列が群馬県太田市に初出店! 家系ラーメン『王道乃印 野上家』」", url: "https://prtimes.jp/main/html/rd/p/000000001.000187957.html", note: "王道家との関係" },
    ],
    mapQuery: "家系ラーメン 王道乃印 柏店 柏市柏3-6-16" },
  { id: "oudou-ishii", name: "王道 いしい", sub: "千葉", pref: "千葉", city: "千葉市中央区", founded: 2017, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "2017年5月に開いた王道家グループの千葉市の店。",
    sources: [
      { title: "王道家 公式サイト「グループ店舗情報」", url: "https://oudouya.com/shop-info/", note: "師匠" },
      { title: "ラーメンデータベース「家系ラーメン 王道 いしい」", url: "https://ramendb.supleks.jp/s/99699.html", note: "開店日・所在地" },
    ],
    mapQuery: "家系ラーメン 王道 いしい 千葉市中央区村田町893-116" },

  // 系図に載らない資本系（修行系譜に属さない）
  { id: "machida", name: "町田商店", sub: "町田", pref: "東京", city: "町田市", founded: 2008, parent: null, lineage: "capital", status: "open", edge: null,
    note: "2008年に町田で創業し、ギフトホールディングスが展開するチェーン。修行の系譜には属さない「資本系」の代表格で、家系を全国に広めた。",
    sources: [
      { title: "EDINET DB「株式会社ギフトホールディングス の沿革」", url: "https://edinetdb.jp/company/E34336/history", note: "創業年・創業地・運営企業" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", note: "資本系" },
    ],
    mapQuery: "横浜家系ラーメン 町田商店 本店 町田市森野1-34-13" },
  { id: "konshin", name: "魂心家", sub: "", pref: "神奈川", city: "大和市ほか", founded: 2010, parent: null, lineage: "capital", status: "open", edge: null,
    note: "ゲーム販売などを営む株式会社トイダック（大和市）が2010年に目黒で始めた資本系チェーン。関東を中心に多店舗化。",
    sources: [
      { title: "株式会社トイダック 公式サイト「会社沿革」", url: "http://www.toyduck.co.jp/history.html", note: "創業年・運営企業" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", note: "資本系" },
    ],
    mapQuery: "横浜家系ラーメン 魂心家" },
  { id: "ichikaku", name: "壱角家", sub: "", pref: "東京", city: "新宿区ほか", founded: 2014, parent: null, lineage: "capital", status: "open", edge: null,
    note: "カラオケ事業の株式会社ガーデンが、ギフト（町田商店）のプロデュースで2014年に新宿で始めた資本系チェーン。都内の駅前に多い。",
    sources: [
      { title: "EDINET DB「株式会社ガーデン の沿革」", url: "https://edinetdb.jp/company/E40066/history", note: "創業年・創業地・運営企業" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", note: "資本系" },
    ],
    mapQuery: "横浜家系ラーメン 壱角家" },
];

// 読み込み時に系譜の整合を検証する。壊れていれば next dev / next build が、原因の店の id を名指しするエラーで止まる（#39）
assertShopsValid(NODES);

export const SHOP_BY_ID = new Map(NODES.map((n) => [n.id, n]));
