import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "プライバシーポリシー | 家系ラーメン家系図",
};

export default function Privacy() {
  return (
    <main className="doc">
      <h1>プライバシーポリシー</h1>

      <h2>アクセス解析ツールについて</h2>
      <p>
        当サイトでは、サイト改善のために Google LLC が提供するアクセス解析ツール「Google アナリティクス 4」を利用しています。
        Google アナリティクスはトラフィックデータの収集のために Cookie（<code>_ga</code> など）を使用します。
        このデータは匿名で収集されており、個人を特定するものではありません。
      </p>

      <h2>収集する情報</h2>
      <ul>
        <li>閲覧したページ、滞在時間、参照元（どのサイトから来たか）</li>
        <li>端末の種類、OS、ブラウザ、画面サイズ、おおよその地域（国・都道府県・市区町村）</li>
        <li>サイト内の操作（店の選択、地図リンクの利用、絞り込み、再生、全体表示など）</li>
      </ul>
      <p>検索欄に入力した文字列は送信しません。送信するのは「検索で該当する店があったかどうか」のみです。</p>

      <h2>Cookie の無効化（オプトアウト）</h2>
      <p>
        Google アナリティクスによる収集は、ブラウザの設定で Cookie を無効にするか、
        <a href="https://tools.google.com/dlpage/gaoptout?hl=ja" target="_blank" rel="noopener noreferrer">Google アナリティクス オプトアウト アドオン</a>
        を利用することで拒否できます。
      </p>
      <p>
        Google によるデータの取り扱いについては
        <a href="https://policies.google.com/technologies/partner-sites?hl=ja" target="_blank" rel="noopener noreferrer">Google のサービスを使用するサイトやアプリから収集した情報の Google による使用</a>
        をご覧ください。
      </p>

      <Link className="back" href="/">← 家系図に戻る</Link>
    </main>
  );
}
