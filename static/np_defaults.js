// np_defaults.js
function currentNpKey() {
  const color = document.getElementById("card_type_np")?.value || "B";
  const tgt   = document.getElementById("np_target_np")?.value || "ST"; // ST or AOE
  const str   = document.getElementById("np_strengthened_np")?.checked ? "U" : "N";
  return `${color}_${tgt}_${str}`; // 例: B_ST_U
}

function loadNpArray(key) {
  const raw = localStorage.getItem("np_defaults_" + key);
  if (raw) return raw.split("/").map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
  if (window.npMultipliers && window.npMultipliers[key]) return window.npMultipliers[key];
  return [];
}

function saveNpArray(key, arr) {
  localStorage.setItem("np_defaults_" + key, arr.join("/"));
}

window.updateNpMvFromDefaults = function () {
  const manual = !!document.getElementById("np_mv_manual")?.checked;
  const mvInput = document.getElementById("np_mv_pct_np");
  if (!mvInput) return;

  mvInput.readOnly = !manual;
  if (manual) return;

  const key = currentNpKey();
  const arr = loadNpArray(key);
  const lvl = Number(document.getElementById("np_level_np")?.value || 5);
  const idx = Math.max(0, Math.min(lvl - 1, 4));

  if (arr.length >= lvl && arr[idx] > 0) {
    mvInput.value = arr[idx];
  }
};

window.editNpDefaults = function () {
  const key = currentNpKey();
  const cur = loadNpArray(key);
  const curStr = cur.join("/");
  const input = prompt(`${key} の倍率を「/」区切りで入力 (例 550/600/650/700/750)\n現在: ${curStr}`, curStr);
  if (input == null) return;
  const arr = input.split("/").map(s => Number(s.trim()));
  if (!arr.length || arr.some(n => Number.isNaN(n) || n <= 0)) {
    alert("数値を / 区切りで入力してください");
    return;
  }
  saveNpArray(key, arr);
  window.updateNpMvFromDefaults();
};
