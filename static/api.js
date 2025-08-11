window.callCalc = async function(payload) {
  const res = await fetch("/api/calc", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    // サーバのエラーメッセージ文字列をそのまま投げる
    throw new Error(await res.text());
  }
  return res.json();
};
