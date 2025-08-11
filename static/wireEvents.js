// wireEvents.js
function wireEvents() {
  // タブ切替 & 計算ボタン
  document.getElementById("tab-crit")?.addEventListener("click", () => activateTab("crit"));
  document.getElementById("tab-np")?.addEventListener("click",   () => activateTab("np"));
  document.getElementById("calc_btn")?.addEventListener("click", () => { calcAndDisplay(); });

  // 宝具倍率の自動入力（色/対象/強化/レベル/手動フラグ）
  ["card_type_np","np_target_np","np_strengthened_np","np_level_np","np_mv_manual"]
    .forEach(id => document.getElementById(id)?.addEventListener("change", () => updateNpMvFromDefaults()));
  document.getElementById("np_defaults_edit")?.addEventListener("click", () => editNpDefaults());
  updateNpMvFromDefaults();

  // サーヴァントCSV → UI初期化（順番が超大事）
  (async () => {
    await window.loadServantsFromCSV();   // load_servantCSV.js
    window.initServantUI();               // init_servantUI.js（グローバル公開済み）
  })();

  // グラフ用のATKレンジ変更 → 再描画（直近の計算値があるときだけ）
  ["atk_min","atk_max","atk_step"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", () => {
      if (window.__lastA) window.renderAtkChart(window.__lastA, window.__lastSub, window.__lastFixed);
    });
  });
}

// 必要ならグローバル公開
window.wireEvents = wireEvents;
