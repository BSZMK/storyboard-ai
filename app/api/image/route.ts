import { NextResponse } from "next/server";

// 🔑 关键:延长 Serverless 超时(Hobby 最多 60s,Pro 最多 300s)
export const maxDuration = 60;
export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { prompt, style = "<auto>", size = "1280*720" } = await req.json();
    const apiKey = process.env.DASHSCOPE_API_KEY;
    
    if (!apiKey) return NextResponse.json({ error: "未配置 DASHSCOPE_API_KEY" }, { status: 500 });
    if (!prompt) return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });

    // 🚀 优化 1:使用 Turbo 模型,速度提升 5-10 倍
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
          model: "wanx2.1-t2i-turbo",   // ⚡ 极速版
          input: { prompt },
          parameters: { 
            size,                        // 默认 1280*720
            n: 1,
            prompt_extend: false,        // 关闭自动扩写,更快
          },
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
    
    // 🚀 优化 2:更短的初始等待 + 更密的轮询(turbo 通常 3-5s 出图)
    await new Promise((r) => setTimeout(r, 2500));  // 首次直接等 2.5s
    
    for (let i = 0; i < 30; i++) {
      const q = await fetch(`https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      });
      const qd = await q.json();
      const s = qd.output?.task_status;
      
      if (s === "SUCCEEDED") {
        return NextResponse.json({ 
          url: qd.output.results?.[0]?.url,
          taskId,
        });
      }
      if (s === "FAILED") {
        return NextResponse.json({ error: qd.output.message || "生成失败" }, { status: 500 });
      }
      
      // 🚀 优化 3:轮询间隔从 2s 缩短到 1s
      await new Promise((r) => setTimeout(r, 1000));
    }
    
    return NextResponse.json({ error: "生成超时" }, { status: 504 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}