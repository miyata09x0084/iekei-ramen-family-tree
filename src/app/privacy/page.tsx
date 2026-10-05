import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー",
  alternates: { canonical: "/privacy" },
};

export default function Privacy() {
  return (
    <main className="doc">
      <h1>プライバシーポリシー</h1>
      <p>このページでは、このサイトがどんな情報を集めて、何に使うかを説明します。</p>

      <h2>サイトを見た人の数を数える道具について</h2>
      <p>
        このサイトでは、サイトをもっと良くするために、Google が提供する「Google アナリティクス 4」という道具を使っています。
        この道具は、どのページがどれくらい見られたかを数えるために、Cookie（クッキー。ブラウザに保存される小さなデータで、<code>_ga</code> などの名前がついています）を使います。
        集めたデータに名前や住所は含まれず、「誰が見たか」は分かりません。
      </p>

      <h2>集める情報</h2>
      <ul>
        <li>見たページ、見ていた時間、どのサイトから来たか</li>
        <li>使っている機械の種類（パソコンやスマホ）、OS、ブラウザ、画面の大きさ、おおよその場所（国・都道府県・市区町村）</li>
        <li>サイトの中での操作（お店を選んだ、地図を開いた、絞り込みをした、「1974年からもう一度見る」を押した、全体を表示した、など）</li>
      </ul>
      <p>検索欄に入力した文字は送りません。送るのは「探したお店が見つかったかどうか」だけです。</p>

      <h2>情報を集めないようにする方法</h2>
      <p>
        ブラウザの設定で Cookie を使わないようにするか、
        <a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">Google アナリティクス オプトアウト アドオン</a>
        をブラウザに入れると、情報を集められないようにできます。
      </p>
      <p>
        Google が集めたデータをどう扱うかは、
        <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener noreferrer">Google のサービスを使用するサイトやアプリから収集した情報の Google による使用</a>
        というページで読めます。
      </p>

      <Link className="back" href="/">← 家系図に戻る</Link>
    </main>
  );
}
