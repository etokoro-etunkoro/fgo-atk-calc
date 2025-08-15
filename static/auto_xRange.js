function computeAutoXRange(step) {
  const base  = window.__BaseAtk;
  const lv120 = window.__lv120Atk;

  // 両方ある：min/base−500 〜 max/lv120＋500
  if (Number.isFinite(base) && Number.isFinite(lv120)) {
    let min = Math.min(base, lv120) - 500;
    let max = Math.max(base, lv120) + 2500;
    min = Math.max(0, min);
    // きりの良い刻みに丸める（step=200なら…）
    min = Math.floor(min / step) * step;
    max = Math.ceil(max / step) * step;
    if (max <= min) max = min + step * 5; // 念のため幅確保
    return {min, max};
  }

  // 片方だけある：±500 で囲む
  const one = Number.isFinite(base) ? base : (Number.isFinite(lv120) ? lv120 : null);
  if (one != null) {
    let min = Math.max(0, one - 500);
    let max = one + 2500;
    min = Math.floor(min / step) * step;
    max = Math.ceil(max / step) * step;
    if (max <= min) max = min + step * 5;
    return {min, max};
  }

  // どちらも無い：null（従来入力を使う）
  return null;
}
