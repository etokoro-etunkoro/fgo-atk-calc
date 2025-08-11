// CSV -> window.servants へ
window.loadServantsFromCSV = async function() {
  const res = await fetch("/static/data/servants.csv?cachebust=" + Date.now());
  if (!res.ok) throw new Error("servants.csv を取得できませんでした");
  const text = await res.text();

  // BOM除去
  const t = text.replace(/^\uFEFF/, "").trim();
  if (!t) { window.servants = []; return; }

  const lines = t.split(/\r?\n/);
  const header = lines.shift().split(",").map(s => s.trim());

  const toNumber = (v) => {
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
  };

  const rows = lines.map(line => {
    // 引用無し簡易CSV想定（カンマ含むセルがあれば要拡張）
    const cols = line.split(",").map(s => s.trim());
    const o = {};
    header.forEach((h, i) => {
      const val = cols[i] ?? "";
      // 数値列を数値化
      if (/^(base_atk|lv100_atk|lv120_atk)$/.test(h)) {
        o[h] = toNumber(val);
      } else {
        o[h] = val;
      }
    });
    return o;
  });

  window.servants = rows;
};
