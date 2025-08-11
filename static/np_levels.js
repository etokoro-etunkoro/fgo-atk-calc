// キー生成
function currentNpKey() {
  const color = document.getElementById("card_type_np")?.value || "B";
  const tgt   = document.getElementById("np_target_np")?.value || "ST"; // ST or AOE
  const str   = document.getElementById("np_strengthened_np")?.checked ? "U" : "N"; // U=強化, N=未強化
  return `${color}_${tgt}_${str}`; // 例: B_ST_U
}

function loadNpArray(key) {
  // まず localStorage（ユーザー保存）を探す
  const raw = localStorage.getItem("np_defaults_" + key);
  if (raw) {
    return raw.split("/").map(s => Number(s.trim())).filter(n => !Number.isNaN(n));
  }

  // 次に static データ
  if (window.npMultipliers && window.npMultipliers[key]) {
    return window.npMultipliers[key];
  }

  // 見つからなければ空
  return [];
}


// 自動反映（手動OFFのときだけ）
window.updateNpMvFromDefaults = function() {
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

// 倍率セット編集（今の組み合わせキーに対して配列を登録）
window.editNpDefaults = function() {
  const key = currentNpKey();
  const cur = loadNpArray(key);
  const curStr = cur.join("/");
  const input = prompt(
    `${key} の宝具倍率（Lv1〜Lv5）を「/」区切りで入力\n例: 550/600/650/700/750\n現在: ${curStr}`,
    curStr
  );
  if (input == null) return;
  const arr = input.split("/").map(s => Number(s.trim()));
  if (arr.length < 1 || arr.some(n => Number.isNaN(n) || n <= 0)) {
    alert("数値（%）を「/」区切りで入力してください。例: 550/600/650/700/750");
    return;
  }
  saveNpArray(key, arr);
  updateNpMvFromDefaults();
};
