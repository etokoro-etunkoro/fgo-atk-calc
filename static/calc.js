// ペイロード共通部
window.buildPayloadBase = function() {
  return {
    target_damage:  getNum("target_damage"),
    fixed_damage:   getNum("fixed_damage"),
    ce_atk:         getNum("ce_atk"),
    footprint:      getNum("footprint"),
    rand_mode:      "avg", // 乱数はavg固定でAをもらう

    // %入力（サーバで小数化）
    atk_up:         getStr("atk_up"),
    color_up:       getStr("color_up"),
    trait:          getStr("trait"),
    target_taken:   getStr("target_taken"),
    power_up:       getStr("power_up"),
    special_resist: getStr("special_resist"),

    // 実数補正
    class_correction: 1.0,
    class_affinity:   getNum("class_affinity"),
    attribute:        1.0,
    first_buster:     !!document.getElementById("first_buster")?.checked,
  };
};

// タブ別ペイロード
window.buildPayload = function(tab) {
  const base = buildPayloadBase();
  if (tab === "crit") {
    return {
      ...base,
      attack_type: "normal",
      card_type:   getStr("card_type_crit"),
      is_crit:     !!(document.getElementById("is_crit_crit")?.checked),
      crit_dmg:    getStr("crit_dmg_crit"),
      // 宝具用はゼロ送信
      np_dmg:      "0",
      np_mv_pct:   0,
      trait_np_pct:"100",
    };
  } else {
    return {
      ...base,
      attack_type: "np",
      card_type:   getStr("card_type_np"),
      is_crit:     false,
      // クリ用はゼロ送信
      crit_dmg:    "0",
      np_mv_pct:   getNum("np_mv_pct_np"),
      np_target:   getStr("np_target_np"),          // "ST" | "AOE"（今は参考情報）
      np_upgraded: !!document.getElementById("np_strengthened_np")?.checked, // True/False
      np_dmg:      getStr("np_dmg_np"),
      trait_np_pct:getNum("trait_np_pct_np"),

    };
  }
};

// Aから必要ATKを逆算
window.requiredAtkFromA = function(A, subAdd, target, fixed) {
  return Math.max(Math.ceil((target - fixed) / A - subAdd), 0);
};

// 計算実行＋画面反映（最小/平均/最大）
window.calcAndDisplay = async function() {
  const payload = window.buildPayload(window.currentTab);

  try {
    const data = await window.callCalc(payload);

    // 単発（平均）
    document.getElementById("result").textContent =
      `必要ATK: ${data.required_atk.toLocaleString()}`;

    // A を最小/平均/最大にスケール
    const det    = data.detail;
    const target = getNum("target_damage");
    const fixed  = getNum("fixed_damage");
    const sub    = det.sub_add;

    const Aavg = data.A;
    const Amin = Aavg * 0.9;
    const Amax = Aavg * 1.099;

    const reqMin = requiredAtkFromA(Amin, sub, target, fixed);
    const reqAvg = requiredAtkFromA(Aavg, sub, target, fixed);
    const reqMax = requiredAtkFromA(Amax, sub, target, fixed);

    const resultMultiEl = document.getElementById("result_multi");
    if (resultMultiEl) {
      resultMultiEl.textContent =
        `必要ATK（最小/平均/最大）: ${reqMin.toLocaleString()} / ${reqAvg.toLocaleString()} / ${reqMax.toLocaleString()}`;
    }

    const debugEl = document.getElementById("debug");
    if (debugEl) {
      debugEl.textContent =
`A(avg)=${Aavg.toFixed(6)} | A(min)=${Amin.toFixed(6)} | A(max)=${Amax.toFixed(6)}
attack_mult=${det.attack_mult.toFixed(4)}
card_power=${det.card_power.toFixed(4)}
atk_change=${det.atk_change.toFixed(4)}
c_frame=${det.c_frame.toFixed(4)}
np_trait=${det.np_trait.toFixed(4)}
final_power=${det.final_power.toFixed(4)}
rand_mod=${det.rand_mod.toFixed(4)}
sub(礼装+足跡)=${det.sub_add}`;
    }

    // ←← ここに移動：グラフ更新と保持
    window.__lastA    = data.A;
    window.__lastSub  = det.sub_add;
    window.__lastFixed= getNum("fixed_damage");
    window.renderAtkChart(data.A, det.sub_add, getNum("fixed_damage"), window.__lv120Atk);

  } catch (e) {
    document.getElementById("result").textContent = "計算エラー";
    document.getElementById("debug").textContent = e.message;
  }
};

