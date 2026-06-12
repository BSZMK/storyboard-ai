import { NextResponse } from "next/server";

// 🔑 延长 Serverless 超时(Hobby 最多 60s)
export const maxDuration = 60;
export const runtime = "nodejs";

// 🎨 风格预设:在 prompt 后追加风格描述词
const STYLE_PRESETS: Record<string, string> = {
  sketch:
    "black and white storyboard sketch, rough pencil lines, hand-drawn, monochrome line art, film storyboard style, minimal shading, clean composition",
  anime:
    "anime style, cel shading, vibrant colors, detailed character design, studio ghibli inspired",
  realistic:
    "photorealistic, cinematic lighting, 8k, ultra detailed, film still, depth of field",
  cinematic:
    "cinematic shot, movie still, dramatic lighting, wide angle, film grain, color graded",
  watercolor:
    "watercolor painting, soft brush strokes, pastel colors, artistic, dreamy atmosphere",
  auto: "", // 不加任何风格词
};

export async function POST(req: Request) {
  try {
    const {
      prompt,
      style = "sketch",        // 🎬 默认草图风格(分镜场景)
      size = "1280*720",
    } = await req.json();

    const apiKey = process.env.DASHSCOPE_API_KEY;

    if (!apiKey)
      return NextResponse.json(
        { error: "未配置 DASHSCOPE_API_KEY" },
        { status: 500 }
      );
    if (!prompt)
      return NextResponse.json({ error: "缺少 prompt" }, { status: 400 });

    // 🎨 自动拼接风格词
    const styleSuffix = STYLE_PRESETS[style] ?? STYLE_PRESETS.auto;
    const finalPrompt = styleSuffix
      ? `${prompt}, ${styleSuffix}`
      : prompt;

    // 🚀 1. 提交生成任务(Turbo 模型)
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
          input: { prompt: finalPrompt },
          parameters: {
            size,
            n: 1,
            prompt_extend: false,        // 关闭自动扩写,更快更可控
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

    // 🚀 2. 轮询查询结果
    await new Promise((r) => setTimeout(r, 2500));

    for (let i = 0; i < 30; i++) {
      const q = await fetch(
        `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`,
        {
          headers: { Authorization: `Bearer ${apiKey}` },
          cache: "no-store",
        }
      );
      const qd = await q.json();
      const s = qd.output?.task_status;

      if (s === "SUCCEEDED") {
        return NextResponse.json({
          url: qd.output.results?.[0]?.url,
          taskId,
          style,
          finalPrompt, // 调试用,方便看到实际送进模型的 prompt
        });
      }
      if (s === "FAILED") {
        return NextResponse.json(
          { error: qd.output.message || "生成失败" },
          { status: 500 }
        );
      }

      await new Promise((r) => setTimeout(r, 1000));
    }

    return NextResponse.json({ error: "生成超时" }, { status: 504 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}