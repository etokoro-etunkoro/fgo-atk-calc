function computeYRangeFromPoints(ptsArrays, { padRatio = 0.08, include = [] } = {}) {
  // ptsArrays: [ptsMin, ptsAvg, ptsMax] の配列（各要素は [{x,y}, ...]）
  let ys = [];
  for (const arr of ptsArrays) if (Array.isArray(arr)) ys = ys.concat(arr.map(p => p.y));
  for (const v of include) if (Number.isFinite(v)) ys.push(v);
  if (ys.length === 0) return null;

  let yMin = Math.min(...ys);
  let yMax = Math.max(...ys);

  // 同値ガード
  if (yMax <= yMin) { yMax = yMin + 1; }

  // パディング
  const span = yMax - yMin;
  const pad  = Math.max(1, Math.floor(span * padRatio));
  yMin -= pad;
  yMax += pad;

  // きりの良い値に丸める（例：1000刻み）
  const tick = Math.pow(10, Math.max(0, String(Math.floor(yMax)).length - 3)); // 1000/100/10…をざっくり
  const roundDown = n => Math.floor(n / tick) * tick;
  const roundUp   = n => Math.ceil(n  / tick) * tick;

  yMin = roundDown(yMin);
  yMax = roundUp(yMax);

  // 最低幅ガード
  if (yMax - yMin < tick * 5) yMax = yMin + tick * 5;

  return { min: yMin, max: yMax };
}
