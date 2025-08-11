// 簡易入力（+20%, Set, ×2, クリア）とクランプ

// 各フィールドの許容範囲（%系中心）
const CLAMP = {
  atk_up:         { min: -100, max: 400 },  // 攻バフは-100%〜+400%程度（適宜調整）
  color_up:       { min: 0,    max: 500 },  // カード性能
  trait:          { min: 0,    max: 1000 }, // 特攻（イベント系で大きくなることあり）
  target_taken:   { min: 0,    max: 500 },  // 被ダメUP
  power_up:       { min: 0,    max: 500 },  // 威力アップ
  special_resist: { min: 0,    max: 100 },  // 特殊耐性（軽減％）
  crit_dmg_crit:  { min: 0,    max: 500 },  // クリ威力
  np_dmg_np:      { min: 0,    max: 500 },  // 宝具威力
  trait_np_pct_np:{ min: 0,    max: 1000 }, // 宝具特攻倍率(%、100=等倍)
  footprint:      { min: 0,    max: 2000 }, // 足跡(フットプリント)は適当に広め
  ce_atk:         { min: 0,    max: 3000 }, // 礼装ATKも控えめにクランプ
};

function clamp(id, v) {
  const rule = CLAMP[id];
  if (!rule) return v;
  if (typeof rule.min === "number") v = Math.max(v, rule.min);
  if (typeof rule.max === "number") v = Math.min(v, rule.max);
  return v;
}

function getVal(el) {
  return Number(el.value || 0);
}

function setVal(el, id, v) {
  el.value = clamp(id, v);
}

function handleInc(el, id, delta) {
  const now = getVal(el);
  setVal(el, id, now + delta);
}

function handleSet(el, id, val) {
  setVal(el, id, val);
}

function handleMul(el, id, mul) {
  const now = getVal(el);
  setVal(el, id, now * mul);
}

function handleClear(el, id) {
  setVal(el, id, 0);
}

function parseDataAttr(attrVal) {
  // "field:20" を ["field", 20] に
  const [id, numStr] = String(attrVal).split(":");
  return [id, Number(numStr)];
}

function isButton(el) {
  return el && el.tagName === "BUTTON";
}

function onClick(e) {
  const btn = e.target.closest("button");
  if (!isButton(btn)) return;

  // 優先順位：clear > set > inc > mul
  if (btn.hasAttribute("data-clear")) {
    const id = btn.getAttribute("data-clear");
    const el = document.getElementById(id);
    if (el) handleClear(el, id);
    return;
  }

  if (btn.hasAttribute("data-set")) {
    const [id, v] = parseDataAttr(btn.getAttribute("data-set"));
    const el = document.getElementById(id);
    if (el) handleSet(el, id, v);
    return;
  }

  if (btn.hasAttribute("data-inc")) {
    const [id, d] = parseDataAttr(btn.getAttribute("data-inc"));
    const el = document.getElementById(id);
    if (el) handleInc(el, id, d);
    return;
  }

  if (btn.hasAttribute("data-mul")) {
    const [id, m] = parseDataAttr(btn.getAttribute("data-mul"));
    const el = document.getElementById(id);
    if (el) handleMul(el, id, m);
    return;
  }
}

function wireQuickInc() {
  document.addEventListener("click", onClick);
}
