import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    const apiKey = process.env.DASHSCOPE_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "未配置 API Key" }, { status: 500 });
    if (!prompt) return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });

    const createRes = await fetch(
      "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "X-DashScope-Async": "enable",
        },
        body: JSON.stringify({
          model: "wanx-v1",
          input: { prompt },
          parameters: { style: "<sketch>", size: "1280*720", n: 1 },
        }),
      }
    );
    const createData = await createRes.json();
    if (!createData.output?.task_id) {
      return NextResponse.json(
        { error: createData.message || JSON.stringify(createData) },
        { status: 500 }
      );
    }

    const taskId = createData.output.task_id;
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const q = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      const qd = await q.json();
      const s = qd.output?.task_status;
      if (s === "SUCCEEDED") return NextResponse.json({ url: qd.output.results?.[0]?.url });
      if (s === "FAILED") return NextResponse.json({ error: qd.output.message }, { status: 500 });
    }
    return NextResponse.json({ error: "生成超时" }, { status: 504 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
