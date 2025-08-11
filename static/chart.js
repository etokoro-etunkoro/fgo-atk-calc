let atkChart;

function buildDamageSeries(A, subAdd, fixed, atkMin, atkMax, step) {
  const xs = [];
  const ysAvg = [], ysMin = [], ysMax = [];
  const Amin = A * 0.9, Amax = A * 1.099;

  for (let atk = atkMin; atk <= atkMax; atk += step) {
    xs.push(atk);
    ysAvg.push(Math.floor((atk + subAdd) * A    + fixed));
    ysMin.push(Math.floor((atk + subAdd) * Amin + fixed));
    ysMax.push(Math.floor((atk + subAdd) * Amax + fixed));
  }
  return { xs, ysAvg, ysMin, ysMax };
}

window.renderAtkChart = function(A, subAdd, fixed) {
  const atkMin = Number(document.getElementById("atk_min").value || 1000);
  const atkMax = Number(document.getElementById("atk_max").value || 14000);
  const step   = Number(document.getElementById("atk_step").value || 200);
  const { xs, ysAvg, ysMin, ysMax } = buildDamageSeries(A, subAdd, fixed, atkMin, atkMax, step);

  const ctx = document.getElementById("atkChart").getContext("2d");
  if (atkChart) atkChart.destroy();
  atkChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: xs,
      datasets: [
        { label: "最小(0.9)", data: ysMin, borderWidth: 2, pointRadius: 0 },
        { label: "平均(1.0)", data: ysAvg, borderWidth: 2, pointRadius: 0 },
        { label: "最大(1.099)", data: ysMax, borderWidth: 2, pointRadius: 0 },
      ]
    },
    options: {
      animation: false,
      responsive: true,
      scales: {
        x: { title: { display: true, text: "ATK" } },
        y: { title: { display: true, text: "ダメージ" }, beginAtZero: true }
      },
      plugins: { legend: { display: true } }
    }
  });
};
