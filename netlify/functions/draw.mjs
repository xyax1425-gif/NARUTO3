import { getStore } from "@netlify/blobs";

export default async (request) => {
  const headers = {
    "Content-Type": "application/json"
  };

  if (request.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "不正なアクセスです" }),
      { status: 405, headers }
    );
  }

  try {
    const body = await request.json();
    const number = String(body.number || "").trim();

    if (!/^\d{1,20}$/.test(number)) {
      return new Response(
        JSON.stringify({ error: "抽選番号が正しくありません" }),
        { status: 400, headers }
      );
    }

    const store = getStore("naruto-draw");
    const key = `ticket-${number}`;

    // 15％の確率で当たり
    const win = Math.random() < 0.15;

    // 同じ番号の登録を一度だけ許可
    const saved = await store.set(key, JSON.stringify({
      win,
      usedAt: new Date().toISOString()
    }), {
      onlyIfNew: true
    });

    if (!saved) {
      return new Response(
        JSON.stringify({ error: "この番号はすでに抽選済みです！" }),
        { status: 409, headers }
      );
    }

    return new Response(
      JSON.stringify({ win }),
      { status: 200, headers }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: "抽選に失敗しました。もう一度お試しください。" }),
      { status: 500, headers }
    );
  }
};
