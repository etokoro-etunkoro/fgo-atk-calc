from bottle import Bottle, static_file, template, request, response, run, debug
import math

app = Bottle()
debug(True)

#@app.route("/")
#def index():
#    return template("index")  # views/index.tpl

@app.get("/")
def index():
    return static_file("index.html", root='.')

@app.get("/static/<filepath:path>")
def server_static(filepath):
    return static_file(filepath, root="./static")

def pct(x):
    """% -> 小数。空/不正は0扱い"""
    try:
        return float(x) / 100.0
    except:
        return 0.0
    
def as_bool(x):
    if isinstance(x, bool):
        return x
    if isinstance(x, (int, float)):
        return x != 0
    if isinstance(x, str):
        return x.strip().lower() in ("1", "true", "on", "yes")
    return bool(x)

@app.post("/api/calc")
def api_calc():
    d = request.json or {}

    # 基本値
    target       = float(d.get("target_damage", 0))
    fixed_damage = float(d.get("fixed_damage", 0))
    ce_atk       = float(d.get("ce_atk", 0))
    footprint    = float(d.get("footprint", 0))
    sub_add      = ce_atk + footprint

    # 乱数
    rand_mode = d.get("rand_mode", "avg")
    rand_mod  = 1.0 if rand_mode == "avg" else 1.099

    # 種別
    attack_type = d.get("attack_type", "normal")  # "normal" or "np"
    card_type   = d.get("card_type", "B")         # "B"|"A"|"Q"
    is_crit     = as_bool(d.get("is_crit", False))

    # 実数補正（必要ならUIに後で追加）
    class_corr     = float(d.get("class_correction", 1.0))
    class_affinity = float(d.get("class_affinity", 1.0))
    attribute      = float(d.get("attribute", 1.0))
    atk_coef       = 0.23

    # %系（サーバで小数化）
    atk_up         = pct(d.get("atk_up"))
#    def_down       = pct(d.get("def_down"))
    color_up       = pct(d.get("color_up"))
#    color_resist   = pct(d.get("color_resist"))
    trait          = pct(d.get("trait"))
    target_taken   = pct(d.get("target_taken"))
    power_up       = pct(d.get("power_up"))
    special_resist = pct(d.get("special_resist"))
    crit_dmg       = pct(d.get("crit_dmg"))   # クリ専用タブで入力
    np_dmg         = pct(d.get("np_dmg"))     # 宝具専用タブで入力
    # 受取
    first_buster = bool(d.get("first_buster", False))

    # 色補正
    color_coeff = {"B": 1.5, "A": 1.0, "Q": 0.8}.get(card_type, 1.0)

    # カード火力（位置/EX無し）
    card_perf  = max(0.0, 1.0 + color_up)
    card_power = color_coeff * card_perf
    if attack_type == "normal" and first_buster:
        card_power += 0.5
    # 1stBは通常攻撃のみ有効（宝具には乗らない）
    if attack_type == "normal" and first_buster:
        card_power += 0.5


    if attack_type == "np":
        np_mv_pct   = float(d.get("np_mv_pct", 0))      # 例: 550
        attack_mult = np_mv_pct / 100.0
    else:
        attack_mult = 1.0


    # クリ補正
    crit_mod = 2.0 if (attack_type == "normal" and is_crit) else 1.0

    # 攻撃変化（攻バフは-100%まで、敵防デバフは合算100%まで。相殺して0未満は0）
    tmp_atk = max(atk_up, -1.0)
    atk_change = 1.0 + tmp_atk
    if atk_change < 0:
        atk_change = 0.0

    # C枠（特攻/クリ威力/宝具威力/対象被ダメ%）
    # クリ威力は通常+クリ時のみ、宝具威力は宝具時のみ加算
    add_crit = crit_dmg if (attack_type == "normal" and is_crit) else 0.0
    add_np   = np_dmg   if (attack_type == "np") else 0.0
    c_frame = 1.0 + trait + target_taken + add_crit + add_np
    if c_frame <= 0:
        c_frame = 0.001
    # 上限（主要どころ）
    if add_crit > 5.0:  # +500%
        # 送られてきた元のcrit_dmgが上限超だけど、結果のc_frameで飽和させる
        c_frame = 1.0 + trait + target_taken + 5.0 + add_np
    if add_np > 5.0:
        c_frame = 1.0 + trait + target_taken + add_crit + 5.0

    # 宝具特攻（D枠相当）：入力は%（100=等倍）
    trait_np_pct = float(d.get("trait_np_pct", 100))
    np_trait     = trait_np_pct / 100.0

    # 最終側
    final_power = (1.0 + power_up) * (1.0 - special_resist)

    # 総合倍率A
    A = (
        attack_mult
        * card_power
        * class_corr
        * attribute
        * class_affinity
        * rand_mod
        * atk_coef
        * atk_change
        * crit_mod
        * c_frame
        * np_trait
        * final_power
    )

    if A <= 0:
        response.status = 400
        return {"error": "総合倍率Aが0未満になっちゃう。"}

    required_atk = math.ceil((target - fixed_damage) / A - sub_add)
    return {
        "required_atk": max(required_atk, 0),
        "A": A,
        "detail": {
            "attack_mult": attack_mult,
            "card_power": card_power,
            "atk_change": atk_change,
            "c_frame": c_frame,
            "np_trait": np_trait,
            "final_power": final_power,
            "rand_mod": rand_mod,
            "sub_add": sub_add,
        }
    }

if __name__ == "__main__":
    run(app, host="0.0.0.0", port=8080)
