"use client";
import { useEffect, useState } from "react";
import { buildTagPrompt, TAG_LIBRARY } from "../lib/tagLibrary";
import Lightbox from "./Lightbox";

export interface Shot {
  cut: number;
  scene: string;
  shot_type: string;
  camera: string;
  action: string;
  dialogue: string;
  sound: string;
  duration_sec: number;
  duration_frames: number;
  characters?: string;
  notes?: string;
  image_prompt?: string;
  image_url?: string;
}

interface Props {
  initialShots: Shot[];
  presetTagIds?: string[];
  onChange?: (shots: Shot[]) => void;
}

export default function StoryboardTable({ initialShots, presetTagIds = [], onChange }: Props) {
  const [shots, setShots] = useState<Shot[]>(initialShots);
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [batch, setBatch] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  useEffect(() => { setShots(initialShots); }, [initialShots]);
  useEffect(() => { onChange?.(shots); }, [shots]);

  const selectedTagPrompt = buildTagPrompt(presetTagIds);
  const selectedTagNames = TAG_LIBRARY.flatMap(c => c.tags)
    .filter(t => presetTagIds.includes(t.id))
    .map(t => ({ cn: t.cn, icon: TAG_LIBRARY.find(c => c.tags.some(tt => tt.id === t.id))?.icon }));

  const update = (idx: number, key: keyof Shot, val: any) => {
    const next = [...shots];
    (next[idx] as any)[key] = val;
    setShots(next);
  };

  const addShotAfter = (idx: number) => {
    const next = [...shots];
    next.splice(idx + 1, 0, {
      cut: 0, scene: "新场景", shot_type: "MS", camera: "FIX",
      action: "在此输入画面内容…", dialogue: "—", sound: "",
      duration_sec: 3, duration_frames: 0,
    });
    next.forEach((s, i) => (s.cut = i + 1));
    setShots(next);
  };

  const removeShot = (idx: number) => {
    if (!confirm(`删除镜头 #${shots[idx].cut}?`)) return;
    const next = shots.filter((_, i) => i !== idx);
    next.forEach((s, i) => (s.cut = i + 1));
    setShots(next);
  };

  const moveShot = (idx: number, dir: -1 | 1) => {
    const j = idx + dir;
    if (j < 0 || j >= shots.length) return;
    const next = [...shots];
    [next[idx], next[j]] = [next[j], next[idx]];
    next.forEach((s, i) => (s.cut = i + 1));
    setShots(next);
  };

  const generateImage = async (idx: number) => {
    const s = shots[idx];
    const base = s.image_prompt ||
      `${s.action}, black and white storyboard sketch, rough pencil drawing, anime storyboard style, line art`;
    const fullPrompt = selectedTagPrompt ? `${base}, ${selectedTagPrompt}` : base;
    setLoadingIdx(idx);
    try {
      const res = await fetch("/api/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await res.json();
      if (data.url) update(idx, "image_url", data.url);
      else alert("生成失败:" + (data.error || "未知"));
    } finally {
      setLoadingIdx(null);
    }
  };

  const generateAll = async () => {
    setBatch(true);
    for (let i = 0; i < shots.length; i++) {
      if (!shots[i].image_url) await generateImage(i);
    }
    setBatch(false);
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify({ shots, presets: presetTagIds }, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `storyboard-${Date.now()}.json`;
    a.click();
  };

  const totalSec = shots.reduce(
    (a, s) => a + (Number(s.duration_sec) || 0) + (Number(s.duration_frames) || 0) / 24, 0
  ).toFixed(1);

  const imageCount = shots.filter(s => s.image_url).length;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 print:hidden">
        <div className="flex items-baseline gap-4">
          <h2 className="text-3xl font-semibold tracking-tight">
            <span className="text-gradient">Storyboard</span>
            <span className="text-white/50 ml-2 text-base font-normal">分镜表</span>
          </h2>
          <div className="text-sm text-white/40">
            {shots.length} cuts · {totalSec}s · 🖼 {imageCount}/{shots.length}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {imageCount > 0 && (
            <button
              onClick={() => {
                const first = shots.findIndex(s => s.image_url);
                if (first >= 0) setLightboxIdx(first);
              }}
              className="btn-ghost text-sm py-2.5 px-4"
              title="灯箱模式查看图片"
            >
              🔍 灯箱 · Lightbox
            </button>
          )}
          <button onClick={generateAll} disabled={batch} className="btn-primary text-sm py-2.5 px-5">
            {batch ? "⏳ 批量生成中…" : "🎨 批量出图 · Render All"}
          </button>
          <button onClick={exportJSON} className="btn-ghost text-sm">💾 JSON</button>
          <button onClick={() => window.print()} className="btn-ghost text-sm">🖨 PDF</button>
        </div>
      </div>

      {selectedTagNames.length > 0 && (
        <div className="mb-6 p-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] print:hidden">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-cyan-300 text-xs uppercase tracking-wider font-medium">🎬 当前预设</span>
            <span className="text-[11px] text-white/40">自动注入所有 AI 出图</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {selectedTagNames.map((t, i) => (
              <span key={i} className="px-2.5 py-1 rounded-md bg-cyan-400/15 border border-cyan-400/40 text-[11px] text-cyan-100">
                <span className="opacity-50 mr-1">{t.icon}</span>{t.cn}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[80px_80px_1.4fr_1.4fr_1fr_100px_70px] bg-white/[0.04] border-b border-white/10 text-xs font-medium text-white/70 uppercase tracking-wider">
          <Th cn="场景" en="Scene" />
          <Th cn="镜号" en="Cut" />
          <Th cn="画面" en="Picture" />
          <Th cn="内容" en="Action" />
          <Th cn="台词" en="Dialogue" />
          <Th cn="时长" en="Time" />
          <Th cn="操作" en="Edit" className="print:hidden" />
        </div>

        {shots.map((s, idx) => (
          <div key={idx} className="grid grid-cols-[80px_80px_1.4fr_1.4fr_1fr_100px_70px] border-b border-white/5 hover:bg-white/[0.02] transition">
            <Cell>
              <input value={s.scene} onChange={(e) => update(idx, "scene", e.target.value)}
                className="bg-transparent w-full text-center text-xs text-white/70 outline-none focus:text-white" />
            </Cell>
            <Cell>
              <div className="flex flex-col items-center gap-1">
                <div className="w-10 h-10 rounded-full border border-cyan-400/40 bg-cyan-400/5 flex items-center justify-center text-base font-bold text-cyan-300">{s.cut}</div>
                <div className="text-[10px] text-white/40 font-mono">{s.shot_type}</div>
              </div>
            </Cell>
            <Cell className="p-3 min-h-[160px]">
              {s.image_url ? (
                <div className="relative w-full group cursor-zoom-in" onClick={() => setLightboxIdx(idx)}>
                  <img src={s.image_url} alt="" className="w-full rounded-lg border border-white/10 group-hover:border-cyan-400/40 transition" />
                  <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <span className="text-white text-xs px-3 py-1.5 rounded-full bg-black/60 backdrop-blur">🔍 点击查看大图</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); generateImage(idx); }} disabled={loadingIdx === idx}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 backdrop-blur text-white text-[11px] rounded-md opacity-0 group-hover:opacity-100 transition print:hidden">
                    🔄 重绘
                  </button>
                </div>
              ) : (
                <button onClick={() => generateImage(idx)} disabled={loadingIdx === idx}
                  className="w-full h-full min-h-[140px] rounded-lg border border-dashed border-white/15 hover:border-cyan-400/60 hover:bg-cyan-400/[0.03] text-white/40 hover:text-cyan-300 text-xs transition print:hidden">
                  {loadingIdx === idx ? "🎨 AI 绘制中…" : <>🖼<br /><span>点击生成</span><br /><span className="text-[10px]">Generate</span></>}
                </button>
              )}
            </Cell>
            <Cell className="p-3">
              <textarea value={s.action} onChange={(e) => update(idx, "action", e.target.value)} rows={3}
                className="w-full bg-transparent resize-none outline-none text-sm text-white/85 focus:bg-white/[0.03] rounded p-1" />
              <div className="flex flex-wrap gap-1 pt-2 mt-2 border-t border-white/5 text-[10px]">
                <Tag icon="📹" value={s.camera} onChange={(v) => update(idx, "camera", v)} />
                {s.notes && <Tag icon="📝" value={s.notes} onChange={(v) => update(idx, "notes", v)} />}
              </div>
            </Cell>
            <Cell className="p-3">
              <textarea value={s.dialogue} onChange={(e) => update(idx, "dialogue", e.target.value)} rows={3}
                className="w-full bg-transparent resize-none outline-none text-sm text-white/85 focus:bg-white/[0.03] rounded p-1" />
              {s.sound && (
                <div className="text-[11px] text-cyan-200/60 italic mt-2 pt-2 border-t border-white/5">
                  🎵 <input value={s.sound} onChange={(e) => update(idx, "sound", e.target.value)}
                    className="bg-transparent outline-none focus:bg-white/[0.03] rounded px-1"
                    style={{ width: `${Math.max(s.sound.length, 6)}ch` }} />
                </div>
              )}
            </Cell>
            <Cell>
              <div className="flex flex-col items-center font-mono">
                <div className="flex items-baseline gap-0.5 text-lg text-amber-300 font-bold">
                  <NumberCell value={s.duration_sec} onChange={(v) => update(idx, "duration_sec", v)} className="w-7 text-right" />
                  <span className="text-sm text-white/40">+</span>
                  <NumberCell value={s.duration_frames} onChange={(v) => update(idx, "duration_frames", v)} max={23} className="w-7 text-left" />
                </div>
                <div className="text-[9px] text-white/30 mt-0.5">秒+帧</div>
              </div>
            </Cell>
            <Cell className="print:hidden">
              <div className="flex flex-col items-center gap-0.5">
                <IconBtn onClick={() => moveShot(idx, -1)} title="上移">⬆</IconBtn>
                <IconBtn onClick={() => moveShot(idx, 1)} title="下移">⬇</IconBtn>
                <IconBtn onClick={() => addShotAfter(idx)} title="添加" hover="green">+</IconBtn>
                <IconBtn onClick={() => removeShot(idx)} title="删除" hover="red">✕</IconBtn>
              </div>
            </Cell>
          </div>
        ))}
      </div>

      <div className="text-center text-[11px] text-white/30 mt-6">
        Storyboard AI · {new Date().toLocaleDateString()} · 自动保存 · 点击图片查看大图
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          shots={shots}
          currentIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
          onNav={setLightboxIdx}
        />
      )}
    </div>
  );
}

function Th({ cn, en, className = "" }: { cn: string; en: string; className?: string }) {
  return (
    <div className={`p-3 text-center border-r border-white/5 last:border-r-0 ${className}`}>
      <div className="text-white/85">{cn}</div>
      <div className="text-[9px] font-normal text-white/30 mt-0.5">{en}</div>
    </div>
  );
}
function Cell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`border-r border-white/5 last:border-r-0 flex items-center justify-center ${className}`}>{children}</div>;
}
function NumberCell({ value, onChange, max = 999, className = "" }: { value: number; onChange: (v: number) => void; max?: number; className?: string; }) {
  return <input type="number" value={value}
    onChange={(e) => onChange(Math.max(0, Math.min(max, Number(e.target.value) || 0)))}
    className={`bg-transparent outline-none focus:bg-white/[0.05] rounded ${className}`} />;
}
function Tag({ icon, value, onChange }: { icon: string; value: string; onChange: (v: string) => void; }) {
  return (
    <span className="inline-flex items-center gap-1 bg-white/[0.04] border border-white/5 px-2 py-0.5 rounded text-white/60">
      {icon}
      <input value={value} onChange={(e) => onChange(e.target.value)}
        className="bg-transparent outline-none focus:bg-white/[0.05]"
        style={{ width: `${Math.max(value.length, 3)}ch` }} />
    </span>
  );
}
function IconBtn({ children, onClick, title, hover = "default" }: { children: React.ReactNode; onClick: () => void; title: string; hover?: "default" | "green" | "red"; }) {
  const c = { default: "hover:bg-white/10 hover:text-white", green: "hover:bg-emerald-400/10 hover:text-emerald-300", red: "hover:bg-red-400/10 hover:text-red-300" }[hover];
  return <button onClick={onClick} title={title} className={`w-7 h-7 rounded-md text-white/40 text-xs transition ${c}`}>{children}</button>;
}
