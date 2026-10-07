export function Legend() {
  return (
    <div className="legend">
      <details open>
        <summary>印の意味</summary>
        <ul>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#D0402F" /><circle cx="13" cy="8" r="7.5" fill="none" stroke="#D0402F" strokeWidth="1.2" /></svg>直系（吉村家が認めたお店）</li>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#B58AD1" /><circle cx="13" cy="8" r="7.5" fill="none" stroke="#B58AD1" strokeWidth="1.2" strokeDasharray="2 2.5" /></svg>元直系（前は直系だったお店）</li>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#5B8BC0" /></svg>修行して独立したお店（色は系統）</li>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#2B1B12" stroke="#86AE55" strokeWidth="1.6" /></svg>閉店したお店（本店だけ閉店も含む）</li>
          <li><svg viewBox="0 0 26 16"><path d="M2 8H24" stroke="#B9A98E" strokeWidth="1.4" /></svg>師匠から弟子へ</li>
          <li><svg viewBox="0 0 26 16"><path d="M2 8H24" stroke="#B9A98E" strokeWidth="1.4" strokeDasharray="4 4" /></svg>諸説あり（はっきりしない）</li>
          <li><svg viewBox="0 0 26 16"><path d="M2 8H24" stroke="#B9A98E" strokeWidth="1.4" strokeDasharray="1.5 4" /></svg>影響だけ（修行はしていない）</li>
        </ul>
        <p>お店の名前にカーソルを合わせると、吉村家までのつながりが光ります。押すと、そのお店のくわしい説明が開きます。つながりは、公開されている記事などをもとにまとめたものです。もとにした記事は、お店の説明の「出典」で見られます。お店ができた年には、だいたいの年も含みます。</p>
      </details>
    </div>
  );
}
