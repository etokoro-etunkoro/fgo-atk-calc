// プリセット
function loadPresetList() {
  const sel = document.getElementById("preset_select");
  if (!sel) return;
  sel.innerHTML = "";
  const list = JSON.parse(localStorage.getItem("presets") || "[]");
  list.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.name;
    opt.textContent = p.name;
    sel.appendChild(opt);
  });
}
function wirePreset() {
  document.getElementById("preset_save")?.addEventListener("click", () => {
    const name = document.getElementById("preset_name").value.trim();
    if (!name) return alert("プリセット名を入力してください");
    const list = JSON.parse(localStorage.getItem("presets") || "[]")
      .filter(p => p.name !== name);
    list.push({ name, data: snapshot() });
    localStorage.setItem("presets", JSON.stringify(list));
    loadPresetList();
  });
  document.getElementById("preset_load")?.addEventListener("click", () => {
    const name = document.getElementById("preset_select").value;
    const list = JSON.parse(localStorage.getItem("presets") || "[]");
    const hit = list.find(p => p.name === name);
    if (hit) applySnapshot(hit.data);
  });
  document.getElementById("preset_delete")?.addEventListener("click", () => {
    const name = document.getElementById("preset_select").value;
    const list = JSON.parse(localStorage.getItem("presets") || "[]")
      .filter(p => p.name !== name);
    localStorage.setItem("presets", JSON.stringify(list));
    loadPresetList();
  });
  loadPresetList();
}
