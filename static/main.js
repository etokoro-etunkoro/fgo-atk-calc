let currentTab = "crit"; // "crit" or "np"

function activateTab(tab) {
  currentTab = tab;
  document.getElementById("tab-crit").style.fontWeight = tab === "crit" ? "bold" : "normal";
  document.getElementById("tab-np").style.fontWeight   = tab === "np"   ? "bold" : "normal";
  document.getElementById("panel-crit").style.display  = tab === "crit" ? "block" : "none";
  document.getElementById("panel-np").style.display    = tab === "np"   ? "block" : "none";
}

document.getElementById("tab-crit").addEventListener("click", () => activateTab("crit"));
document.getElementById("tab-np").addEventListener("click",   () => activateTab("np"));

const getNum = id => Number(document.getElementById(id)?.value ?? 0);
const getStr = id => (document.getElementById(id)?.value ?? "");

document.getElementById("calc_btn").addEventListener("click", async () => {
  // 存在チェック（デバッグ用）
  ["target_damage","fixed_damage","ce_atk","footprint","rand_mode",
   "atk_up","def_down","color_up","color_resist","trait","target_taken","power_up","special_resist",
   "card_type_crit","crit_dmg_crit","card_type_np","np_mv_pct_np","np_dmg_np","trait_np_pct_np"
  ].forEach(id => { if (!document.getElementById(id)) console.warn(`#${id} が見つかりません`); });

  const base = {
    target_damage:  getNum("target_damage"),
    fixed_damage:   getNum("fixed_damage"),
    ce_atk:         getNum("ce_atk"),
    footprint:      getNum("footprint"),
    rand_mode:      getStr("rand_mode"),

    // %入力（文字列→サーバで小数化）
    atk_up:         getStr("atk_up"),
    def_down:       getStr("def_down"),
    color_up:       getStr("color_up"),
    color_resist:   getStr("color_resist"),
    trait:          getStr("trait"),
    target_taken:   getStr("target_taken"),
    power_up:       getStr("power_up"),
    special_resist: getStr("special_resist"),

    // 実数
    class_correction: 1.0,
    class_affinity:   getNum("class_affinity"),
    attribute:        1.0,
    first_buster:     !!document.getElementById("first_buster")?.checked,
  };

  let payload;
  if (currentTab === "crit") {
    payload = {
      ...base,
      attack_type: "normal",
      card_type:   getStr("card_type_crit"),
      is_crit:     true,
      // クリ専用
      crit_dmg:    getStr("crit_dmg_crit"),
      // 宝具用はゼロ送信
      np_dmg:      "0",
      np_mv_pct:   0,
      trait_np_pct:"100",
    };
  } else {
    payload = {
      ...base,
      attack_type: "np",
      card_type:   getStr("card_type_np"),
      is_crit:     false,
      // 宝具専用
      np_mv_pct:   getNum("np_mv_pct_np"),
      np_dmg:      getStr("np_dmg_np"),
      trait_np_pct:getNum("trait_np_pct_np"),
      // クリ用はゼロ送信
      crit_dmg:    "0",
    };
  }

  try {
    const res = await fetch("/api/calc", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();

    document.getElementById("result").textContent =
      `必要ATK: ${data.required_atk.toLocaleString()}`;

    const det = data.detail;
    document.getElementById("debug").textContent =
`A=${data.A.toFixed(6)}
attack_mult=${det.attack_mult.toFixed(4)}
card_power=${det.card_power.toFixed(4)}
atk_change=${det.atk_change.toFixed(4)}
c_frame=${det.c_frame.toFixed(4)}
np_trait=${det.np_trait.toFixed(4)}
final_power=${det.final_power.toFixed(4)}
rand_mod=${det.rand_mod.toFixed(4)}
sub(礼装+足跡)=${det.sub_add}`;
  } catch (e) {
    document.getElementById("result").textContent = "計算エラー";
    document.getElementById("debug").textContent = e.message;
  }
});

// 初期はクリ専用タブ
activateTab("crit");
