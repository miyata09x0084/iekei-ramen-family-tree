import { assertShopsValid } from "@/lib/validate";

export type LineageKey =
  | "root" | "direct" | "honmoku" | "rokkaku" | "ichi" | "oudou" | "musashi" | "indep" | "capital";
export type EdgeKind = "direct" | "former" | "trained" | "disputed" | "inspired";
export type ShopStatus = "open" | "closed" | "main-closed";
export type Pref = "神奈川" | "東京" | "千葉";

/**
 * 出典の種別。確度（src/lib/certainty.ts）はこの種別から導く。
 *   primary   一次情報: 店・運営会社・吉村家の公式発信、店主本人の語り（インタビュー・連載）、有価証券報告書
 *   secondary 二次情報: 新聞・雑誌・地域メディア・施設公式の取材記事
 *   tertiary  三次情報: Wikipedia、グルメサイトのデータ、まとめ、個人ブログ
 */
export type SourceKind = "primary" | "secondary" | "tertiary";

export const SOURCE_KIND_LABEL: Record<SourceKind, string> = {
  primary: "公式",
  secondary: "新聞・雑誌",
  tertiary: "ネット",
};

/** 出典。店の師匠・創業年・状態などの根拠として示す公開情報。URL は実際に開けることを確認したものだけを載せる */
export interface Source {
  // 媒体名＋ページ名。例: "Wikipedia「吉村家」"、"吉村家 公式サイト「直系店舗」"
  title: string;
  // http(s) で始まる URL。validate.ts が検査する。https が証明書不一致で開けない公式サイトだけ http にする
  url: string;
  kind: SourceKind;
  // この出典が何を裏付けるか（任意）。例: "創業年・師匠"
  note?: string;
  // 出典カード（CONTEXT.md）に出す記事の画像。https の絶対 URL（validate.ts が検査する）。
  // 出典ページの og:image をそのまま参照する（ホットリンク。取り込まない）。
  // その店（丼・店頭・店主）が写っていると目視で確かめた出典にだけ書く。別店舗の画像と期限つき URL は書かない。
  image?: string;
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
  direct: "直系（吉村家が認めたお店）",
  former: "元直系（今は吉村家の認定を外れたお店）",
  trained: "修行して独立したお店",
  disputed: "修行して独立したお店（どこで修行したかは諸説あり）",
  inspired: "影響を受けて開いたお店（修行はしていない）",
};

export const STATUS_LABEL: Record<ShopStatus, string> = {
  open: "営業中",
  closed: "閉店",
  "main-closed": "本店は閉店（支店が名前を受け継ぐ）",
};

export const PREFS: Pref[] = ["神奈川", "東京", "千葉"];
export const YEAR_MIN = 1974;
export const YEAR_MAX = 2026;
// 全店の出典を開いて確かめた日。店ごとには持たず、裏取りを回した日だけ直す（店舗ページの「出典を確かめた日」）
export const SOURCES_CHECKED_AT = "2026-10-05";

// 系譜は公開情報を編集したもの。approx=true の創業年は概算。
// mapQuery は現存する店舗を指す。本店閉店（main-closed）の店は暖簾を継承する店舗を指す。
// 多店舗ブランドは屋号のみを検索して全店舗が地図に出るようにする。
export const NODES: Shop[] = [
  { id: "yoshimura", name: "吉村家", sub: "横浜駅西口", pref: "神奈川", city: "横浜市西区", founded: 1974, parent: null, lineage: "root", status: "open", edge: null,
    note: "1974年、吉村実さんが新杉田で開いた、家系ラーメンのいちばん最初のお店。豚骨しょうゆのスープに、酒井製麺の太い麺、ほうれん草とのり、チャーシューをのせる。お店の名前の「家」が、そのまま「家系」という呼び名のもとになった。1999年に横浜駅西口へ引っ越し、今は同じ西口の岡野にある。総本山と呼ばれ、毎日行列ができる。",
    sources: [
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", kind: "tertiary", note: "できた年・引っ越し・場所", image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/18/%E5%90%89%E6%9D%91%E5%AE%B6_2025%E5%B9%B42%E6%9C%8823%E6%97%A5%E3%81%AE%E6%A8%AA%E6%B5%9C_202502231527_IMG_9695.jpg/1280px-%E5%90%89%E6%9D%91%E5%AE%B6_2025%E5%B9%B42%E6%9C%8823%E6%97%A5%E3%81%AE%E6%A8%AA%E6%B5%9C_202502231527_IMG_9695.jpg?utm_source=ja.wikipedia.org&utm_campaign=index&utm_content=thumbnail" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", kind: "tertiary", note: "できた年・「家系」という名前のもと" },
    ],
    mapQuery: "家系総本山 吉村家 横浜市西区岡野" },

  { id: "honmoku", name: "本牧家", sub: "本牧", pref: "神奈川", city: "横浜市中区", founded: 1986, parent: "yoshimura", lineage: "honmoku", status: "main-closed", edge: "trained",
    note: "1986年、吉村家の2号店として本牧に開いたお店。店長だった神藤隆さんがここから独立して六角家を開き、本牧家そのものも、あとで吉村家から独立した。本牧家系と六角家系という2つの大きな流れは、ここから始まった。本店は港南区に引っ越したあと2023年に閉店し、今は横須賀店が名前を受け継いでいる。",
    sources: [
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", kind: "tertiary", note: "師匠・できた年" },
      { title: "ブログ「本牧家 本店【2023年5月7日で閉店】」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12801099357.html", kind: "tertiary", note: "できた年・本店閉店" },
    ],
    mapQuery: "本牧家 横須賀店 横須賀市本町3-33-3" }, // 本店閉店後は横須賀店が暖簾を継ぐ
  { id: "suzuki", name: "寿々喜家", sub: "上星川", pref: "神奈川", city: "横浜市保土ケ谷区", founded: 1990, parent: "honmoku", lineage: "honmoku", status: "open", edge: "trained",
    note: "本牧家で修行した店主が、1990年に開いたお店。上星川の住宅街で長く愛されている、本牧家系を代表する一軒。正しい書き方は「寿々㐂家」。",
    sources: [
      { title: "家系ラーメンマン「寿々㐂家＠上星川」", url: "https://iekei-ramenman.hatenablog.com/entry/2019/09/24/170000", kind: "tertiary", note: "師匠・できた年", image: "https://cdn.image.st-hatena.com/image/scale/81c126b908da6138266f6a5a7b96223955a7b2a0/backend=imagemagick;version=1;width=1300/https%3A%2F%2Fcdn-ak.f.st-hatena.com%2Fimages%2Ffotolife%2Fi%2Fiekei_ramenman%2F20190923%2F20190923154708.jpg" },
      { title: "横浜ウォッチャー「上星川の家系ラーメン 寿々㐂家」", url: "https://travelyokohama.jp/entry/iekei-ramen-suzukiya-20250217", kind: "tertiary", note: "できた年・系統" },
    ],
    mapQuery: "寿々喜家 本店 横浜市保土ケ谷区上星川2-3-1" },

  { id: "rokkaku", name: "六角家", sub: "六角橋", pref: "神奈川", city: "横浜市神奈川区", founded: 1988, parent: "honmoku", lineage: "rokkaku", status: "main-closed", edge: "trained",
    note: "本牧家の店長だった神藤隆さんが、六角橋に開いたお店。新横浜ラーメン博物館にお店を出したことで、「家系」を日本中に知らせた。本店は2017年に閉店し、戸塚のお店が名前を守っている。2025年に戸塚駅前のトツカーナモールへ引っ越した。",
    sources: [
      { title: "Wikipedia「六角家 (ラーメン店)」", url: "https://ja.wikipedia.org/wiki/六角家_(ラーメン店)", kind: "tertiary", note: "師匠・できた年・本店閉店・引っ越し" },
      { title: "ASCII.jp「あの銘店をもう一度がついにフィナーレ!! 大トリは横浜「六角家1994+」」", url: "https://ascii.jp/elem/000/004/193/4193163/", kind: "secondary", note: "師匠・できた年" },
    ],
    mapQuery: "ラーメン六角家 戸塚 トツカーナモール" }, // 旧・戸塚店（本店は2017年閉店）
  { id: "kaiichi", name: "介一家", sub: "山手", pref: "神奈川", city: "横浜市中区", founded: 1988, approx: true, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "trained",
    note: "本牧家と六角家で働いた店主たちが、1988年ごろに山手で始めたお店。まろやかなスープで六角家系の味を受け継ぎ、山手の本店のほかにも何軒かある。",
    sources: [
      { title: "家系ラーメンマン「1988年オープンの老舗家系ラーメン店 介一家 山手店」", url: "https://iekei-ramenman.hatenablog.com/entry/sukeichiya-yamate", kind: "tertiary", note: "師匠・できた年", image: "https://cdn.image.st-hatena.com/image/scale/a9b4ef1384d5120043813320542ea4d00a2edbd1/backend=imagemagick;version=1;width=1300/https%3A%2F%2Fcdn-ak.f.st-hatena.com%2Fimages%2Ffotolife%2Fi%2Fiekei_ramenman%2F20201012%2F20201012223309.jpg" },
      { title: "ブログ「介一家 山手店＠山手」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12850367560.html", kind: "tertiary", note: "師匠・できた年" },
    ],
    mapQuery: "介一家 山手 横浜市中区" },
  { id: "takasago", name: "たかさご家", sub: "日ノ出町", pref: "神奈川", city: "横浜市中区", founded: 1992, approx: true, parent: "rokkaku", lineage: "rokkaku", status: "open", edge: "disputed",
    note: "1992年ごろに南区高砂町で始まり、あとで日ノ出町に引っ越した。お店を始めるときに六角家出身の海添さんが関わったので六角家系に入れているが、店主本人は六角家で修行していない。そのため、どこにつなぐかには諸説ある。町田家を通して、東京の家系ラーメン（侍など）に大きな影響を与えた。",
    sources: [
      { title: "家系ラーメンマン「日ノ出町の老舗家系 たかさご家 本店」", url: "https://iekei-ramenman.hatenablog.com/entry/takasagoya-honten20210403", kind: "tertiary", note: "できた年・最初の場所・六角家とのつながり", image: "https://cdn.image.st-hatena.com/image/scale/63234fafc2a493962463c134bbe5712cb4cb1793/backend=imagemagick;version=1;width=1300/https%3A%2F%2Fcdn-ak.f.st-hatena.com%2Fimages%2Ffotolife%2Fi%2Fiekei_ramenman%2F20210331%2F20210331234924.jpg" },
      { title: "ブログ「たかさご家 本店＠日ノ出町」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12791610620.html", kind: "tertiary", note: "できた年・最初の場所" },
      { title: "食べログ口コミ「たかさご家 本店 家系Vol.95-2」", url: "https://tabelog.com/kanagawa/A1401/A140102/14003538/dtlrvwlst/B69818078/", kind: "tertiary", note: "店主は六角家で修行していないという説" },
    ],
    mapQuery: "たかさご家 本店 横浜市中区日ノ出町1-17" },
  { id: "machidaya", name: "町田家", sub: "町田", pref: "東京", city: "町田市", founded: 1996, parent: "takasago", lineage: "rokkaku", status: "open", edge: "trained",
    note: "たかさご家で修行した店主が、1996年4月に町田駅前で開いたお店。六角家系の味を東京に持ってきたお店で、ここから渋谷の侍が生まれた。町田商店（資本系）とは別のお店。",
    sources: [
      { title: "食べログ「ラーメン 町田家 町田本店」", url: "https://tabelog.com/tokyo/A1327/A132701/13010323/", kind: "tertiary", note: "開いた日・場所" },
      { title: "ASCII.jp「都内トップクラスの家系ラーメン「侍 池尻店」」", url: "https://ascii.jp/elem/000/004/145/4145926/", kind: "secondary", note: "たかさご家とのつながり" },
      { title: "家系ラーメンマン「創業25年！町田家本店」", url: "https://iekei-ramenman.hatenablog.com/entry/machidaya_honten2021", kind: "tertiary", note: "師匠・できた年", image: "https://cdn.image.st-hatena.com/image/scale/bb1f46eaf65822a974c3bdc7e4fbdd04e7893c04/backend=imagemagick;version=1;width=1300/https%3A%2F%2Fcdn-ak.f.st-hatena.com%2Fimages%2Ffotolife%2Fi%2Fiekei_ramenman%2F20211121%2F20211121231413.jpg" },
    ],
    mapQuery: "ラーメン 町田家 町田本店 町田市原町田3-7-2" },
  { id: "samurai", name: "侍", sub: "渋谷", pref: "東京", city: "渋谷区", founded: 2005, parent: "machidaya", lineage: "rokkaku", status: "open", edge: "trained",
    note: "町田家で修行した森真人さんが、2005年に池尻で開いたお店。2009年に渋谷本店を開き、2021年に道玄坂へ引っ越した。東京の家系ラーメンを代表する一軒。",
    sources: [
      { title: "ASCII.jp「都内トップクラスの家系ラーメン「侍 池尻店」」", url: "https://ascii.jp/elem/000/004/145/4145926/", kind: "secondary", note: "師匠・できた年・つながり" },
      { title: "ブログ「横浜家系ラーメン侍 池尻店＠駒場東大前」", url: "https://ameblo.jp/tatsuya-zero-one/entry-12841559343.html", kind: "tertiary", note: "開いた日" },
      { title: "Retty「横浜家系らーめん侍 渋谷本店」", url: "https://retty.me/restaurant/100001590194/", kind: "tertiary", note: "渋谷本店の開店と引っ越し" },
    ],
    mapQuery: "横浜家系らーめん侍 渋谷本店 渋谷区道玄坂2-6-6" },

  { id: "ichiroku", name: "壱六家", sub: "磯子", pref: "神奈川", city: "横浜市磯子区", founded: 1992, parent: "yoshimura", lineage: "ichi", status: "open", edge: "inspired",
    note: "1992年、「吉村家のようなラーメン屋を作ろう」と磯子で開いたお店。吉村家やその弟子のお店で修行はしておらず、影響を受けて自分たちで始めた。うずらの卵をのせるのが特徴で、「壱系」と呼ばれる仲間の始まりになった。",
    sources: [
      { title: "ASOBUILD「こだわりの味を守り抜く。家系ラーメン「壱六家」に迫る！」", url: "https://asobuild.com/news/3398/", kind: "secondary", note: "できた年・吉村家とのつながり" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", kind: "tertiary", note: "吉村家で修行せず自分で開いたこと・壱系" },
      { title: "はまれぽ.com「家系一大勢力“壱系”の全貌が明かされる！？」", url: "https://hamarepo.com/story.php?page_no=1&story_id=2328", kind: "secondary", note: "できた年・場所" },
    ],
    mapQuery: "ラーメン壱六家 磯子本店 横浜市磯子区森2-2-7" },
  { id: "ichihachi", name: "壱八家", sub: "東戸塚", pref: "神奈川", city: "横浜市戸塚区", founded: 1999, parent: "ichiroku", lineage: "ichi", status: "open", edge: "trained",
    note: "1999年、壱六家から作り方を学んで東戸塚で開いたお店。名前は、壱六家の「壱」と、お店を運営する会社エイトの「八」から。うずらの卵と甘めのスープが壱系のしるしで、横浜を中心に何軒かある。",
    sources: [
      { title: "株式会社エイト 公式サイト「History 私たちの歴史」", url: "https://eight-8.co.jp/about_history.html", kind: "primary", note: "できた年・最初の場所" },
      { title: "株式会社エイト 公式 note「はじめまして 横浜らーめん壱八家です」", url: "https://note.com/kodawari_eight/n/n0f9f952809ed", kind: "primary", note: "師匠・お店の名前のもと", image: "https://assets.st-note.com/production/uploads/images/52684926/rectangle_large_type_2_b18cad9f6bcd9b008199cebe4bbcd525.jpg?fit=bounds&quality=85&width=1280" },
    ],
    mapQuery: "壱八家 東戸塚本店 横浜市戸塚区品濃町515-1" },
  { id: "ichinana", name: "壱七家", sub: "立川", pref: "東京", city: "立川市", founded: 2008, parent: "ichiroku", lineage: "ichi", status: "open", edge: "disputed",
    note: "2008年に立川で開いたお店。魂心家と同じ会社（株式会社トイダック）が運営している。壱六家から分かれたお店だと言われることが多いが、それを示す公式の発信や記事は見つかっていないので、どこにつなぐかには諸説ある。",
    sources: [
      { title: "株式会社トイダック 公式サイト「会社沿革」", url: "http://www.toyduck.co.jp/history.html", kind: "primary", note: "できた年・運営する会社" },
      { title: "Retty「横浜家系ラーメン 立川 壱七家」", url: "https://retty.me/area/PRE13/ARE3/SUB301/100000730898/", kind: "tertiary", note: "できた年・場所" },
      { title: "家系ラーメンマン「壱六家の暖簾分け」", url: "https://iekei-ramenman.hatenablog.com/entry/2019/09/08/180000", kind: "tertiary", note: "壱六家から分かれたお店とする説" },
      { title: "Yahoo!マップ「立川 壱七家」", url: "https://map.yahoo.co.jp/v3/place/1Y4BkbKGlQA", kind: "tertiary", note: "営業しているか・魂心家の姉妹店" },
    ],
    mapQuery: "横浜家系ラーメン 立川 壱七家 立川市柴崎町3-1-9" },

  { id: "musashi-nakano", name: "武蔵家", sub: "新中野", pref: "東京", city: "中野区", founded: 1997, parent: "takasago", lineage: "musashi", status: "open", edge: "trained",
    note: "たかさご家で修行した店主が、1997年に新中野で開いたお店。武蔵家系の本店で、こってりしたスープと無料のライスを東京に広めた。ここから分かれたお店は約90軒ある。",
    sources: [
      { title: "さんたつ by 散歩の達人「武蔵家 中野本店」", url: "https://san-tatsu.jp/supporter/reports/1771/", kind: "tertiary", note: "師匠・できた年" },
      { title: "家系ラーメンマン「1997年創業！武蔵家中野本店」", url: "https://iekei-ramenman.hatenablog.com/entry/musashiya_nakanohonten", kind: "tertiary", note: "師匠・できた年・つながり", image: "https://cdn.image.st-hatena.com/image/scale/9b494f8542d7190f8179cb992ba61d6d8316c943/backend=imagemagick;version=1;width=1300/https%3A%2F%2Fcdn-ak.f.st-hatena.com%2Fimages%2Ffotolife%2Fi%2Fiekei_ramenman%2F20210719%2F20210719222122.jpg" },
      { title: "葛飾経済新聞「葛飾・金町に『ラーメン三浦家』 武蔵家総大将が地元に凱旋出店」", url: "https://katsushika.keizai.biz/headline/1704/", kind: "secondary", note: "分かれたお店の数" },
    ],
    mapQuery: "横浜ラーメン 武蔵家 中野本店 中野区中央4-4-1" },
  { id: "musashi", name: "武蔵家", sub: "千葉", pref: "千葉", city: "千葉市中央区", founded: 2003, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "新中野の武蔵家が、2003年に千葉で開いた1号店。ここから千葉県の中に武蔵家系のお店が広がった。",
    sources: [
      { title: "iekei.jp「武蔵家 千葉本店」", url: "https://iekei.jp/shop/musashiya-chiba", kind: "tertiary", note: "師匠・できた年・つながり", image: "https://pub-bf954aa8adbe410ea0cbc3f1375e2a94.r2.dev/shops/musashiya-chiba/photos/d352482b-acc7-4b07-b49a-36de476ba581_1785404115488_425e7e6f.jpg" },
      { title: "食べログ「武蔵家 千葉本店」", url: "https://tabelog.com/en/chiba/A1201/A120101/12000921/", kind: "tertiary", note: "開いた日" },
    ],
    mapQuery: "らーめん武蔵家 千葉本店 千葉市中央区道場北町317" },
  { id: "budoka", name: "武道家", sub: "早稲田", pref: "東京", city: "新宿区", founded: 2006, parent: "musashi-nakano", lineage: "musashi", status: "open", edge: "trained",
    note: "新中野の武蔵家で修行した菊地輝さんが、2006年に開いたお店。早稲田の学生街でとても人気があり、「濃い」といえばここ、と言われる東京の家系ラーメンの代表。",
    sources: [
      { title: "高田馬場経済新聞「早大近くの家系ラーメン『武道家』が20周年」", url: "https://takadanobaba.keizai.biz/headline/1659/", kind: "secondary", note: "師匠・できた年", image: "https://images.keizai.biz/takadanobaba_keizai/headline/1780023567_photo.jpg" },
      { title: "高田馬場経済新聞「早大近くのラーメン店『武道家』が15周年」", url: "https://takadanobaba.keizai.biz/headline/664/", kind: "secondary", note: "師匠・できた年" },
    ],
    mapQuery: "横浜家系らーめん 武道家 本店 新宿区馬場下町" },
  { id: "budoka2", name: "武道家", sub: "吉祥寺", pref: "東京", city: "武蔵野市", founded: 2013, parent: "budoka", lineage: "musashi", status: "open", edge: "trained",
    note: "2013年に開いた武道家の2号店。家系ラーメンのお店が多い吉祥寺で、本店ゆずりのこってりしたスープを出す。",
    sources: [
      { title: "さんたつ by 散歩の達人「家系激戦区の吉祥寺にある『武道家 吉祥寺店』」", url: "https://san-tatsu.jp/articles/232841/", kind: "secondary", note: "師匠・できた年" },
      { title: "食べログ「武道家 吉祥寺店」", url: "https://tabelog.com/en/tokyo/A1320/A132001/13159783/", kind: "tertiary", note: "開いた日・場所" },
    ],
    mapQuery: "横浜家系らーめん 武道家 吉祥寺店 武蔵野市吉祥寺南町1-5-11" },

  { id: "kondo", name: "近藤家", sub: "北山田", pref: "神奈川", city: "横浜市都筑区", founded: 1992, parent: "rokkaku", lineage: "indep", status: "open", edge: "disputed",
    note: "本牧家と六角家で働いた近藤健一さんが、1992年に北山田で開いたお店。「六角家から独立した」と書く記事と、「本牧家と六角家の両方」と書く記事があり、師匠をどちらにするかには諸説ある。1997年には川崎店も開き、横浜の北のほうで自分の道を歩む古いお店。",
    sources: [
      { title: "Yahoo!ニュース エキスパート「３０年以上、家系ラーメンの礎を築いたレジェンド店に行ってみた！！【家系】」", url: "https://news.yahoo.co.jp/expert/articles/03bbb3f6a018e69fc71d21d2998229bf3463f0aa", kind: "secondary", note: "できた年・店主・川崎店" },
      { title: "ラーメンデータベース「近藤家 本店」", url: "https://ramendb.supleks.jp/s/2488.html", kind: "tertiary", note: "できた年・六角家とのつながり" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", kind: "tertiary", note: "本牧家・六角家とのつながり" },
    ],
    mapQuery: "ラーメン近藤家 本店 横浜市都筑区北山田1-1-39" },

  { id: "sugita", name: "杉田家", sub: "新杉田", pref: "神奈川", city: "横浜市磯子区", founded: 1999, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "吉村家が横浜駅西口に引っ越したあとの場所で、一番弟子の津村進さんが1999年に開いたお店。直系の1号店で、家系ラーメンが始まった場所で当時の味を守り続けている。",
    sources: [
      { title: "吉村家 公式サイト「直系店舗のご案内」", url: "http://ieke1.com/source/yosimuraya/chokei.html", kind: "primary", note: "直系に認められたこと" },
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", kind: "tertiary", note: "師匠・できた年・直系1号店" },
      { title: "ラーメン杉田家 公式サイト「家系について」", url: "https://sugitaya.com/iekei/", kind: "primary", note: "直系1号店" },
    ],
    mapQuery: "ラーメン杉田家 本店 横浜市磯子区新杉田町3-5" },
  { id: "sugita-chiba", name: "杉田家", sub: "千葉店", pref: "千葉", city: "千葉市中央区", founded: 2011, parent: "sugita", lineage: "direct", status: "open", edge: "direct",
    note: "2011年に開いた杉田家の2号店。店主は津村進さんの長男、津村文博さん。千葉で吉村家の直系を代表するお店。",
    sources: [
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", kind: "tertiary", note: "できた年・店主" },
      { title: "ラーメンデータベース「杉田家 千葉祐光店」", url: "https://ramendb.supleks.jp/s/31049.html", kind: "tertiary", note: "開いた日・直系" },
    ],
    mapQuery: "ラーメン杉田家 千葉祐光店 千葉市中央区祐光4-17-7" },
  { id: "kan2", name: "環２家", sub: "環状2号線", pref: "神奈川", city: "横浜市港南区", founded: 2000, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "2000年12月、直系の2号店として環状2号線ぞいの下永谷に開いたお店。2015年にお店の持ち主が変わって直系を外れたが、2021年5月に直系にもどった。",
    sources: [
      { title: "ラーメンデータベース「環2家」", url: "https://ramendb.supleks.jp/s/1614.html", kind: "tertiary", note: "開いた日・直系を外れたこと、もどったこと" },
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", kind: "tertiary", note: "直系を外れたこと、もどったこと" },
      { title: "note「時系列で追う家系ラーメンの歴史」", url: "https://note.com/3almon/n/nd016f1274867", kind: "tertiary", note: "師匠・できた年" },
    ],
    mapQuery: "ラーメン環2家 横浜市港南区下永谷3-3-21" },
  { id: "atsugi", name: "厚木家", sub: "本厚木", pref: "神奈川", city: "厚木市", founded: 2005, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "2005年11月に開いたお店。神奈川県の真ん中、厚木にある直系のお店で、吉村実さんの次男、吉村政紀さんがやっている。",
    sources: [
      { title: "吉村家 公式サイト「直系店舗のご案内」", url: "http://ieke1.com/source/yosimuraya/chokei.html", kind: "primary", note: "直系に認められたこと・場所" },
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", kind: "tertiary", note: "できた年・店主" },
    ],
    mapQuery: "ラーメン厚木家 厚木市妻田東2-25-11" },
  { id: "suehiro", name: "末廣家", sub: "白楽", pref: "神奈川", city: "横浜市神奈川区", founded: 2013, parent: "yoshimura", lineage: "direct", status: "open", edge: "direct",
    note: "2013年7月、六角橋商店街の近くの白楽に開いた直系のお店。店主は末廣良信さん。",
    sources: [
      { title: "Wikipedia「吉村家」", url: "https://ja.wikipedia.org/wiki/吉村家", kind: "tertiary", note: "できた年・店主・直系" },
      { title: "食べログ「ラーメン 末廣家」", url: "https://tabelog.com/kanagawa/A1401/A140205/14051496/", kind: "tertiary", note: "開いた日・直系" },
    ],
    mapQuery: "末廣家 横浜市神奈川区六角橋1-14-7" },

  { id: "oudou", name: "王道家", sub: "柏", pref: "千葉", city: "柏市", founded: 2003, parent: "yoshimura", lineage: "oudou", status: "open", edge: "former",
    note: "清水裕正さんが吉村家で修行したあと、2003年に柏で開いたお店。直系として認められたが、2011年に直系を外れた。2017年にビルが古くなって取手に引っ越し、2019年10月に柏へもどった。自分のお店で作る麺を強みに、独自の流れを作っている。",
    sources: [
      { title: "Wikipedia「王道家」", url: "https://ja.wikipedia.org/wiki/王道家", kind: "tertiary", note: "師匠・できた年・直系を外れたこと・引っ越し" },
      { title: "ASCII.jp「読むだけで美味しいラーメン『物語』第14回」", url: "https://ascii.jp/elem/000/004/013/4013189/", kind: "primary", note: "師匠・できた年・直系を外れたこと" },
      { title: "王道家 公式ブログ「柏 王道家オープン！」", url: "https://oudouya.com/2019/09/14/kashiwa-open/", kind: "primary", note: "柏へもどったこと" },
    ],
    mapQuery: "家系ラーメン 王道家 柏市明原1-7-26" },
  { id: "torakichi", name: "とらきち家", sub: "東白楽", pref: "神奈川", city: "横浜市神奈川区", founded: 2014, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "王道家で修行した店主が、2014年に横浜の東白楽で開いた、王道家グループのお店。店主は2024年に東白楽のお店を閉め、2025年に平塚でまた始めた。東白楽のお店は弟子が「とらきち家 光」として受け継いでいる。",
    sources: [
      { title: "食べログ「家系ラーメン とらきち家（東白楽）」", url: "https://tabelog.com/kanagawa/A1401/A140205/14053454/", kind: "tertiary", note: "開いた日・王道家とのつながり" },
      { title: "王道家 公式サイト「グループ店舗情報」", url: "https://oudouya.com/shop-info/", kind: "primary", note: "師匠" },
      { title: "ラーメンデータベース「家系ラーメン とらきち家」", url: "https://ramendb.supleks.jp/s/72495.html", kind: "tertiary", note: "開いた日・平塚への引っ越し" },
    ],
    mapQuery: "とらきち家 光 横浜市神奈川区西神奈川3-1-1" },
  { id: "oudou-shirushi", name: "王道乃印", sub: "柏", pref: "千葉", city: "柏市", founded: 2023, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "王道家グループが、2023年12月に柏駅東口で始めた仲間のお店。ここで修行した人が、ほかの場所でもお店を開いている。",
    sources: [
      { title: "ラーメンデータベース「家系ラーメン 王道乃印 柏店」", url: "https://ramendb.supleks.jp/s/154145.html", kind: "tertiary", note: "開いた日・場所" },
      { title: "PR TIMES「王道家系列が群馬県太田市に初出店! 家系ラーメン『王道乃印 野上家』」", url: "https://prtimes.jp/main/html/rd/p/000000001.000187957.html", kind: "primary", note: "王道家とのつながり" },
    ],
    mapQuery: "家系ラーメン 王道乃印 柏店 柏市柏3-6-16" },
  { id: "oudou-ishii", name: "王道 いしい", sub: "千葉", pref: "千葉", city: "千葉市中央区", founded: 2017, parent: "oudou", lineage: "oudou", status: "open", edge: "trained",
    note: "2017年5月に開いた、王道家グループの千葉市のお店。",
    sources: [
      { title: "王道家 公式サイト「グループ店舗情報」", url: "https://oudouya.com/shop-info/", kind: "primary", note: "師匠" },
      { title: "ラーメンデータベース「家系ラーメン 王道 いしい」", url: "https://ramendb.supleks.jp/s/99699.html", kind: "tertiary", note: "開いた日・場所" },
    ],
    mapQuery: "家系ラーメン 王道 いしい 千葉市中央区村田町893-116" },

  // 系図に載らない資本系（修行系譜に属さない）
  { id: "machida", name: "町田商店", sub: "町田", pref: "東京", city: "町田市", founded: 2008, parent: null, lineage: "capital", status: "open", edge: null,
    note: "2008年に町田で始まり、ギフトホールディングスという会社が日本中にたくさんのお店を出している。修行のつながりではなく会社が広げた「資本系」の代表で、家系ラーメンを日本中に広めた。",
    sources: [
      { title: "EDINET DB「株式会社ギフトホールディングス の沿革」", url: "https://edinetdb.jp/company/E34336/history", kind: "primary", note: "できた年・最初の場所・運営する会社" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", kind: "tertiary", note: "資本系" },
    ],
    mapQuery: "横浜家系ラーメン 町田商店 本店 町田市森野1-34-13" },
  { id: "konshin", name: "魂心家", sub: "", pref: "神奈川", city: "大和市ほか", founded: 2010, parent: null, lineage: "capital", status: "open", edge: null,
    note: "ゲームの販売などをしている株式会社トイダック（大和市）が、2010年に目黒で始めた資本系のお店。関東を中心にたくさんのお店がある。",
    sources: [
      { title: "株式会社トイダック 公式サイト「会社沿革」", url: "http://www.toyduck.co.jp/history.html", kind: "primary", note: "できた年・運営する会社" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", kind: "tertiary", note: "資本系" },
    ],
    mapQuery: "横浜家系ラーメン 魂心家" },
  { id: "ichikaku", name: "壱角家", sub: "", pref: "東京", city: "新宿区ほか", founded: 2014, parent: null, lineage: "capital", status: "open", edge: null,
    note: "カラオケのお店をしている株式会社ガーデンが、ギフト（町田商店）の力を借りて2014年に新宿で始めた資本系のお店。東京の駅前に多い。",
    sources: [
      { title: "EDINET DB「株式会社ガーデン の沿革」", url: "https://edinetdb.jp/company/E40066/history", kind: "primary", note: "できた年・最初の場所・運営する会社" },
      { title: "Wikipedia「家系ラーメン」", url: "https://ja.wikipedia.org/wiki/家系ラーメン", kind: "tertiary", note: "資本系" },
    ],
    mapQuery: "横浜家系ラーメン 壱角家" },
];

// 読み込み時に系譜の整合を検証する。壊れていれば next dev / next build が、原因の店の id を名指しするエラーで止まる（#39）
assertShopsValid(NODES);

export const SHOP_BY_ID = new Map(NODES.map((n) => [n.id, n]));
