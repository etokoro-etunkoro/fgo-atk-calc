// init_servantUI.js
function initServantUI() {
  const sel  = document.getElementById("svt_select");
  const info = document.getElementById("svt_info");
  if (!sel) return;

  sel.innerHTML = "";
  (window.servants || []).forEach(s => {
    const opt = document.createElement("option");
    opt.value = s.id;
    opt.textContent = s.name;
    sel.appendChild(opt);
  });

  function updateInfo() {
    const s = (window.servants || []).find(x => x.id === sel.value);
    if (!s) return;
    info.textContent =
      `基礎ATK: ${s.base_atk?.toLocaleString?.() ?? "-"} / ` +
      `Lv90: ${s.lv90_atk?.toLocaleString?.() ?? "-"} / ` +
      `Lv120: ${s.lv120_atk?.toLocaleString?.() ?? "-"}`;

    if (s.base_atk) document.getElementById("atk_min").value = s.base_atk;
    const maxGuess = s.lv120_atk || s.lv100_atk || (s.base_atk + 8000);
    document.getElementById("atk_max").value = maxGuess;
  }

  sel.addEventListener("change", () => {
    updateInfo();
    if (window.__lastA) window.renderAtkChart(window.__lastA, window.__lastSub, window.__lastFixed);
  });

  ["atk_min","atk_max","atk_step"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", () => {
      if (window.__lastA) window.renderAtkChart(window.__lastA, window.__lastSub, window.__lastFixed);
    });
  });

  updateInfo();
}

// グローバルに公開（自動実行はしない）
window.initServantUI = initServantUI;
