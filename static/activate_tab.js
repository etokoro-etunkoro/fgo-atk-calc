// タブ切替
window.activateTab = function(tab) {
  window.currentTab = tab;
  document.getElementById("tab-crit").style.fontWeight = tab === "crit" ? "bold" : "normal";
  document.getElementById("tab-np").style.fontWeight   = tab === "np"   ? "bold" : "normal";
  document.getElementById("panel-crit").style.display  = tab === "crit" ? "block" : "none";
  document.getElementById("panel-np").style.display    = tab === "np"   ? "block" : "none";
};