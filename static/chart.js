let atkChart;
// annotation があれば登録（A案）
const Annotation = window.ChartAnnotation || window['chartjs-plugin-annotation'];
if (Annotation) {
  Chart.register(Annotation);
}

// フォールバック: プラグインが無いとき自前で線を引く
const GuideLinesFallback = {
  id: 'GuideLinesFallback',
  afterDatasetsDraw(chart) {
    // annotation プラグインが使えるなら何もしない
    const hasAnno = !!(window.ChartAnnotation || window['chartjs-plugin-annotation']);
    if (hasAnno) return;

    const ctx = chart.ctx;
    const xScale = chart.scales.x;
    const yScale = chart.scales.y;
    if (!xScale || !yScale) return;

    // 目標ダメージ（水平）
    const target = Number(document.getElementById("target_damage")?.value || 0);
    if (Number.isFinite(target)) {
      const y = yScale.getPixelForValue(target);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xScale.left, y);
      ctx.lineTo(xScale.right, y);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#ff4d4d';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText('目標ダメージ', xScale.right - 6, y - 4);
      ctx.restore();
    }

    // Lv.120 ATK（垂直）
    const lv120Atk = window.__lv120Atk;
    if (Number.isFinite(lv120Atk)) {
      const x = xScale.getPixelForValue(lv120Atk);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yScale.bottom);
      ctx.lineTo(x, yScale.top);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4dd2ff';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Lv.120 ATK', x + 4, yScale.top + 4);
      ctx.restore();
    }

    // Lv.100 ATK
    const lv100Atk = window.__lv100Atk
    if (Number.isFinite(lv100Atk)) {
      const x = xScale.getPixelForValue(lv100Atk);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yScale.bottom);
      ctx.lineTo(x, yScale.top);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#4dd200';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Lv.100 ATK', x + 4, yScale.top + 4);
      ctx.restore();
    }

    // 聖杯なし ATK
    const BaseAtk = window.__BaseAtk
    if (Number.isFinite(BaseAtk)) {
      const x = xScale.getPixelForValue(BaseAtk);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yScale.bottom);
      ctx.lineTo(x, yScale.top);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#f224ff';
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText('Base ATK', x + 4, yScale.top + 4);
      ctx.restore();
    }
    for (const g of collectAtkGuideValues()) {
      const x = xScale.getPixelForValue(g.x);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(x, yScale.bottom);
      ctx.lineTo(x, yScale.top);
      ctx.lineWidth = 2;
      ctx.setLineDash(g.dash || []);
      ctx.strokeStyle = g.color;
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(g.label, x + 4, yScale.top + 4);
      ctx.restore();
    }

  }
};
Chart.register(GuideLinesFallback);


function buildDamageSeries(A, subAdd, fixed, atkMin, atkMax, step) {
  const ptsAvg = [], ptsMin = [], ptsMax = [];
  const Amin = A * 0.9, Amax = A * 1.099;

  for (let atk = atkMin; atk <= atkMax; atk += step) {
    ptsAvg.push({ x: atk, y: Math.floor((atk + subAdd) * A    + fixed) });
    ptsMin.push({ x: atk, y: Math.floor((atk + subAdd) * Amin + fixed) });
    ptsMax.push({ x: atk, y: Math.floor((atk + subAdd) * Amax + fixed) });
  }
  return { ptsAvg, ptsMin, ptsMax };
}

window.renderAtkChart = function(A, subAdd, fixed, lv120Atk) {



  const step   = Number(document.getElementById("atk_step").value || 200);
  const guideLines = collectAtkGuideValues();

  // まずは自動レンジを試す。無ければ従来の入力値を使う
  
  const auto = (() => {
    const a = computeAutoXRange(step);
    if (!a) return null;
    // 追加: ラインのxも含めて広げる
    const xs = guideLines.map(g => g.x).filter(Number.isFinite);
    if (xs.length) {
      a.min = Math.min(a.min, Math.min(...xs) - 200); // 少し余白
      a.max = Math.max(a.max, Math.max(...xs) + 200);
      // きりの良い丸め（既存の丸め関数があればそれを利用）
      a.min = Math.floor(a.min / step) * step;
      a.max = Math.ceil(a.max / step) * step;
    }
    return a;
  })();

  const fallbackMin = Number(document.getElementById("atk_min").value || 1000);
  const fallbackMax = Number(document.getElementById("atk_max").value || 14000);
  const atkMin = auto ? auto.min : fallbackMin;
  const atkMax = auto ? auto.max : fallbackMax;

  // （任意）UIにも反映しておくと分かりやすい
  if (auto) {
    const minEl = document.getElementById("atk_min");
    const maxEl = document.getElementById("atk_max");
    if (minEl) minEl.value = atkMin;
    if (maxEl) maxEl.value = atkMax;
  }

  const { ptsAvg, ptsMin, ptsMax } = buildDamageSeries(A, subAdd, fixed, atkMin, atkMax, step);
  const target = Number(document.getElementById("target_damage").value || 0);
  const yAuto = computeYRangeFromPoints([ptsMin, ptsAvg, ptsMax], { include: [target] });
  const ctx = document.getElementById("atkChart").getContext("2d");
  if (atkChart) atkChart.destroy();

  const hasAnno = !!(window.ChartAnnotation || window['chartjs-plugin-annotation']);

  const baseOptions = {
    animation: false,
    responsive: true,
    parsing: false,                  // ← {x,y} をそのまま使う
    scales: {
      x: { type: 'linear',min: atkMin, max: atkMax ,title: { display: true, text: 'ATK' } },
      y: yAuto
      ? { min: yAuto.min, max: yAuto.max, title: { display: true, text: 'ダメージ' } }
      : { beginAtZero: true, title: { display: true, text: 'ダメージ' } }
    },
    plugins: { legend: { display: true } }
  };

  if (hasAnno) {
    const target = Number(document.getElementById("target_damage").value || 0);
    const ann = {
      targetLine: {
        type: 'line',
        yMin: target, yMax: target,
        borderColor: '#ff4d4d', borderWidth: 2,
        label: { display: true, content: '目標ダメージ', color: '#fff', position: 'end' }
      }
    };

    for (const g of guideLines) {
      ann[g.key] = {
        type: 'line',
        xMin: g.x, xMax: g.x,
        borderColor: g.color,
        borderWidth: 2,
        borderDash: g.dash || [],
        label: { display: true, content: g.label, color: '#fff', position: 'start' }
      };
    }

    if (Number.isFinite(lv120Atk)) {
      ann.lv120Line = {
        type: 'line',
        xMin: lv120Atk, xMax: lv120Atk,  
        borderColor: '#4dd2ff', borderWidth: 2,
        label: { display: true, content: `Lv.120 ATK (${lv120Atk})`, color: '#fff', position: 'start' }
      };
    }
    if (Number.isFinite(window.__lv100Atk)) {
      ann.lv100Line = {
        type: 'line',
        xMin: window.__lv100Atk, xMax: window.__lv100Atk,  
        borderColor: '#4dd200', borderWidth: 2,
        label: { display: true, content: `Lv.100 ATK (${lv100Atk})`, color: '#fff', position: 'start' }
      };
    }    
    if (Number.isFinite(BaseAtk)) {
      ann.Baseline = {
        type: 'line',
        xMin: window.__BaseAtk, xMax: window.__BaseAtk,  
        borderColor: '#f224ff', borderWidth: 2,
        label: { display: true, content: `Base ATK (${lv100Atk})`, color: '#fff', position: 'start' }
      };
    }

    baseOptions.plugins.annotation = { annotations: ann };
  }

  atkChart = new Chart(ctx, {
    type: "line",
    data: {
      datasets: [
        { label: "最小(0.9)",  data: ptsMin, borderWidth: 2, pointRadius: 0, showLine: true },
        { label: "平均(1.0)",  data: ptsAvg, borderWidth: 2, pointRadius: 0, showLine: true },
        { label: "最大(1.099)",data: ptsMax, borderWidth: 2, pointRadius: 0, showLine: true },
      ]
    },
    options: baseOptions
  });
};

// フォウくん入れた場合の派生ライン作る
function collectAtkGuideValues() {
  const showRaw = !!document.getElementById("show_raw_atk")?.checked;

  const base  = window.__BaseAtk;
  const lv100 = window.__lv100Atk;
  const lv120 = window.__lv120Atk;

  const lines = [];  // {key, x, label, color, dash?}

  // まずデフォルト表示（育成込み）
  if (Number.isFinite(lv100)) {
    lines.push({ key: 'lv100p1k', x: lv100 + 1000, label: `Lv.100 +1000 (${lv100 + 1000})`, color: '#06d6a0' });
    lines.push({ key: 'lv100p2k', x: lv100 + 2000, label: `Lv.100 +2000 (${lv100 + 2000})`, color: '#0bbf8a', dash: [6,4] });
  }
  if (Number.isFinite(lv120)) {
    lines.push({ key: 'lv120p1k', x: lv120 + 1000, label: `Lv.120 +1000 (${lv120 + 1000})`, color: '#4dd2ff' });
    lines.push({ key: 'lv120p2k', x: lv120 + 2000, label: `Lv.120 +2000 (${lv120 + 2000})`, color: '#37b6e6', dash: [6,4] });
  }

  // チェックONなら「育成抜き」の素のラインも追加
  if (showRaw) {
    if (Number.isFinite(base))  lines.push({ key: 'baseRaw',  x: base,  label: `基礎ATK (${base})`,     color: '#ffd166' });
    if (Number.isFinite(lv100)) lines.push({ key: 'lv100Raw', x: lv100, label: `Lv.100 ATK (${lv100})`, color: '#06d6a0', dash: [2,3] });
    if (Number.isFinite(lv120)) lines.push({ key: 'lv120Raw', x: lv120, label: `Lv.120 ATK (${lv120})`, color: '#4dd2ff', dash: [2,3] });
  }

  return lines;
}
