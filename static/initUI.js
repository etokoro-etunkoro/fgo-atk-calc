// 初期化
window.initUI = function() {
  wireEvents();
  wireQuickInc();
  wirePreset();
  activateTab("crit"); // 初期タブ
};