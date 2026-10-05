export function Legend() {
  return (
    <div className="legend">
      <details open>
        <summary>凡例</summary>
        <ul>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#D0402F" /><circle cx="13" cy="8" r="7.5" fill="none" stroke="#D0402F" strokeWidth="1.2" /></svg>直系（吉村家認定）</li>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#B58AD1" /><circle cx="13" cy="8" r="7.5" fill="none" stroke="#B58AD1" strokeWidth="1.2" strokeDasharray="2 2.5" /></svg>元直系</li>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#5B8BC0" /></svg>修行・独立</li>
          <li><svg viewBox="0 0 26 16"><circle cx="13" cy="8" r="4" fill="#2B1B12" stroke="#86AE55" strokeWidth="1.6" /></svg>閉店・本店閉店</li>
          <li><svg viewBox="0 0 26 16"><path d="M2 8H24" stroke="#B9A98E" strokeWidth="1.4" /></svg>暖簾分け・修行</li>
          <li><svg viewBox="0 0 26 16"><path d="M2 8H24" stroke="#B9A98E" strokeWidth="1.4" strokeDasharray="4 4" /></svg>諸説あり</li>
          <li><svg viewBox="0 0 26 16"><path d="M2 8H24" stroke="#B9A98E" strokeWidth="1.4" strokeDasharray="1.5 4" /></svg>影響（師弟関係なし）</li>
        </ul>
        <p>屋号にカーソルを合わせると吉村家までの系譜が浮かび、押すと詳細が開きます。系譜は公開情報を編集したもので、各店の出典は詳細に載せています。創業年は概算を含みます。</p>
      </details>
    </div>
  );
}
