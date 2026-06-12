import { NextResponse } from "next/server";

const QWEN_KEY = process.env.DASHSCOPE_API_KEY;
const QWEN_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export async function POST(req: Request) {
  try {
    const { story, style, duration, shotsCount = 6, characterContext = "" } = await req.json();
    if (!story?.trim()) return NextResponse.json({ error: "剧情不能为空" }, { status: 400 });
    if (!QWEN_KEY) return NextResponse.json({ error: "未配置 DASHSCOPE_API_KEY" }, { status: 500 });

    const charBlock = characterContext
      ? `\n\n角色设定(image_prompt 中需带入英文外貌描述,保持形象一致):\n${characterContext}`
      : "";

    const prompt = `你是顶级的电影分镜师。请将以下剧情拆分为 ${shotsCount} 个镜头(必须严格 ${shotsCount} 个),总时长约 ${duration} 秒。
风格:${style}
剧情:${story}${charBlock}

要求:
1. 严格输出 JSON 数组,不要任何解释文字
2. 每个镜头包含完整字段
3. 镜头时长合理分配,平均 ${(duration / shotsCount).toFixed(1)} 秒
4. shot_type 用专业缩写: ECU/CU/MCU/MS/MLS/LS/ELS/OTS/POV
5. camera 用专业缩写: PAN/TILT/DOLLY/ZOOM/CRANE/HANDHELD/STEADICAM/FIX
6. image_prompt 用英文,需融合角色外貌(若有)

返回格式(JSON 数组,${shotsCount} 个对象):
[
  {
    "cut": 1,
    "scene": "INT. 便利店",
    "shot_type": "MS",
    "camera": "STEADICAM",
    "action": "画面描述",
    "dialogue": "台词或'—'",
    "sound": "环境音/音效",
    "duration_sec": 3,
    "duration_frames": 12,
    "image_prompt": "英文 prompt"
  }
]`;

    const res = await fetch(QWEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${QWEN_KEY}` },
      body: JSON.stringify({
        model: "qwen-plus",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      }),
    });

    const data = await res.json();
    if (!res.ok) return NextResponse.json({ error: data.error?.message || "Qwen 调用失败" }, { status: 500 });

    let content = data.choices?.[0]?.message?.content || "[]";
    content = content.replace(/```json\s*/g, "").replace(/```/g, "").trim();
    const m = content.match(/\[[\s\S]*\]/);
    if (m) content = m[0];

    let shots;
    try { shots = JSON.parse(content); }
    catch { return NextResponse.json({ error: "AI 返回格式异常,请重试" }, { status: 500 }); }

    return NextResponse.json({ shots });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
