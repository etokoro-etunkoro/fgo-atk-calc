window.getNum = function(id) {
  return Number(document.getElementById(id)?.value || 0);
};
window.getStr = function(id) {
  return String(document.getElementById(id)?.value ?? "");
};
window.snapshot = function() {
  const o = {};
  (window.idsAll || []).forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    o[id] = (el.type === "checkbox") ? !!el.checked : el.value;
  });
  o.__tab = window.currentTab;
  return o;
};
window.applySnapshot = function(o) {
  if (!o) return;
  if (o.__tab === "np") window.activateTab?.("np"); else window.activateTab?.("crit");
  (window.idsAll || []).forEach(id => {
    const el = document.getElementById(id);
    if (!el || !(id in o)) return;
    if (el.type === "checkbox") el.checked = !!o[id];
    else el.value = o[id];
  });
};
