import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "入力を確認してください" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const number = String(body.number ?? "").trim();
  if (!/^[0-9]{1,30}$/.test(number)) {
    return new Response(JSON.stringify({ error: "番号を確認してください" }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  const store = getStore("naruto-used-ticket-numbers");
  const win = Math.random() < 0.15;

  // onlyIfNew makes claiming a ticket number conditional and prevents reuse
  // across different devices and simultaneous requests.
  const { modified } = await store.set(
    number,
    JSON.stringify({ win, usedAt: new Date().toISOString() }),
    { onlyIfNew: true }
  );

  if (!modified) {
    return new Response(JSON.stringify({ error: "この番号は使用済みです" }), {
      status: 409,
      headers: { "Content-Type": "application/json" }
    });
  }

  return new Response(JSON.stringify({ win }), {
    status: 200,
    headers: { "Content-Type": "application/json" }
  });
};
