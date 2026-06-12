"use client";
import { useState, useEffect, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Shot } from "./StoryboardTable";
import { buildTagPrompt, TAG_LIBRARY } from "../lib/tagLibrary";
import { useToast } from "./Toast";

interface Props {
  shots: Shot[];
  onChange: (shots: Shot[]) => void;
  presetTagIds?: string[];
  onPreview: (idx: number) => void;
  selectedIdx: number | null;
  onSelect: (idx: number) => void;
}

export default function DraggableStoryboard({ shots, onChange, presetTagIds = [], onPreview, selectedIdx, onSelect }: Props) {
  const toast = useToast();
  const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
  const [batch, setBatch] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");

  const selectedTagPrompt = buildTagPrompt(presetTagIds);

  const update = (idx: number, key: keyof Shot, val: any) => {
    const next = [...shots];
    (next[idx] as any)[key] = val;
    onChange(next);
  };

  const move = (from: number, to: number) => {
    if (from === to) return;
    const next = [...shots];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    next.forEach((s, i) => (s.cut = i + 1));
    onChange(next);
  };

  const removeShot = (idx: number) => {
    if (!confirm(`删除镜头 #${shots[idx].cut}?`)) return;
    const next = shots.filter((_, i) => i !== idx);
    next.forEach((s, i) => (s.cut = i + 1));
    onChange(next);
    toast.show("已删除", "info");
  };

  const addShot = (afterIdx: number) => {
    const next = [...shots];
    next.splice(afterIdx + 1, 0, {
      cut: 0, scene: "新场景", shot_type: "MS", camera: "FIX",
      action: "在此输入画面…", dialogue: "—", sound: "",
      duration_sec: 3, duration_frames: 0,
    });
    next.forEach((s, i) => (s.cut = i + 1));
    onChange(next);
  };

  const generateImage = async (idx: number) => {
    const s = shots[idx];
    const base = s.image_prompt || `${s.action}, black and white storyboard sketch, anime style`;
    const fullPrompt = selectedTagPrompt ? `${base}, ${selectedTagPrompt}` : base;
    setLoadingIdx(idx);
    try {
      const res = await fetch("/api/image", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: fullPrompt }),
      });
      const data = await res.json();
      if (data.url) update(idx, "image_url", data.url);
      else toast.show("生成失败:" + (data.error || "未知"), "error");
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
    toast.show("✓ 批量出图完成", "success");
  };

  const totalSec = shots.reduce(
    (a, s) => a + (Number(s.duration_sec) || 0) + (Number(s.duration_frames) || 0) / 24, 0
  ).toFixed(1);
  const imageCount = shots.filter(s => s.image_url).length;

  return (
    <DndProvider backend={HTML5Backend}>
      <div>
        {/* 工具栏 */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <div className="flex items-baseline gap-3">
            <h2 className="text-2xl font-semibold tracking-tight">
              <span className="text-gradient">Storyboard</span>
              <span className="text-white/40 ml-2 text-sm font-normal">分镜表</span>
            </h2>
            <div className="text-xs text-white/40 font-mono">
              {shots.length} cuts · {totalSec}s · 🖼 {imageCount}/{shots.length}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="flex rounded-lg overflow-hidden border border-white/10">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 text-xs transition ${viewMode === "grid" ? "bg-cyan-400/20 text-cyan-200" : "text-white/50 hover:text-white"}`}
              >▦ 网格</button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-xs transition ${viewMode === "table" ? "bg-cyan-400/20 text-cyan-200" : "text-white/50 hover:text-white"}`}
              >☰ 列表</button>
            </div>
            <button onClick={generateAll} disabled={batch} className="btn-primary text-xs py-1.5 px-3">
              {batch ? "⏳ 批量…" : "🎨 批量出图"}
            </button>
          </div>
        </div>

        {/* 网格视图 */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {shots.map((s, i) => (
              <ShotCard
                key={`${s.cut}-${i}`}
                shot={s} idx={i}
                isSelected={selectedIdx === i}
                isLoading={loadingIdx === i}
                onMove={move}
                onSelect={() => onSelect(i)}
                onUpdate={(k, v) => update(i, k, v)}
                onPreview={() => onPreview(i)}
                onGenerate={() => generateImage(i)}
                onRemove={() => removeShot(i)}
                onAdd={() => addShot(i)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {shots.map((s, i) => (
              <ShotRow
                key={`${s.cut}-${i}`}
                shot={s} idx={i}
                isSelected={selectedIdx === i}
                isLoading={loadingIdx === i}
                onMove={move}
                onSelect={() => onSelect(i)}
                onUpdate={(k, v) => update(i, k, v)}
                onPreview={() => onPreview(i)}
                onGenerate={() => generateImage(i)}
                onRemove={() => removeShot(i)}
              />
            ))}
          </div>
        )}
      </div>
    </DndProvider>
  );
}

/* ============ 卡片视图 ============ */
function ShotCard({ shot, idx, isSelected, isLoading, onMove, onSelect, onUpdate, onPreview, onGenerate, onRemove, onAdd }: any) {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: "SHOT", item: { idx },
    collect: m => ({ isDragging: m.isDragging() }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: "SHOT",
    hover: (item: any) => {
      if (item.idx !== idx) {
        onMove(item.idx, idx);
        item.idx = idx;
      }
    },
    collect: m => ({ isOver: m.isOver() }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`group glass rounded-2xl overflow-hidden transition cursor-move ${
        isDragging ? "opacity-30 scale-95" : "opacity-100"
      } ${isSelected ? "ring-2 ring-cyan-400 shadow-2xl shadow-cyan-500/20" : "hover:ring-1 hover:ring-white/20"} ${
        isOver ? "scale-[1.02]" : ""
      }`}
    >
      {/* 缩略图 */}
      <div className="relative aspect-video bg-gradient-to-br from-slate-800 to-slate-900 cursor-zoom-in"
        onClick={(e) => { e.stopPropagation(); shot.image_url ? onPreview() : onGenerate(); }}>
        {shot.image_url ? (
          <img src={shot.image_url} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/30">
            {isLoading ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin" />
                <span className="text-[10px] mt-2">绘制中…</span>
              </>
            ) : (
              <>
                <span className="text-3xl">🖼</span>
                <span className="text-[10px] mt-1">点击生成</span>
              </>
            )}
          </div>
        )}
        {/* 拖拽手柄 */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-white font-mono flex items-center gap-1">
          <span className="text-white/50">⋮⋮</span>
          <span>#{shot.cut}</span>
        </div>
        <div className="absolute top-2 right-2 flex gap-1">
          <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-white font-mono">{shot.shot_type}</span>
        </div>
        <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur text-[10px] text-amber-300 font-mono">
          {((Number(shot.duration_sec) || 0) + (Number(shot.duration_frames) || 0) / 24).toFixed(1)}s
        </div>
      </div>

      {/* 内容 */}
      <div className="p-3 space-y-2" onClick={(e) => e.stopPropagation()}>
        <input
          value={shot.scene}
          onChange={(e) => onUpdate("scene", e.target.value)}
          className="bg-transparent w-full text-xs font-medium text-white outline-none focus:bg-white/[0.05] rounded px-1"
        />
        <textarea
          value={shot.action}
          onChange={(e) => onUpdate("action", e.target.value)}
          rows={2}
          className="w-full bg-transparent text-xs text-white/80 outline-none focus:bg-white/[0.05] rounded p-1 resize-none"
        />
        <div className="flex items-center justify-between text-[10px] pt-2 border-t border-white/5">
          <span className="text-cyan-300/70 truncate flex-1">{shot.dialogue}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <IconBtn onClick={onGenerate} title="重绘">🎨</IconBtn>
            <IconBtn onClick={onAdd} title="后插入">+</IconBtn>
            <IconBtn onClick={onRemove} title="删除" danger>✕</IconBtn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ 列表视图 ============ */
function ShotRow({ shot, idx, isSelected, isLoading, onMove, onSelect, onUpdate, onPreview, onGenerate, onRemove }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag({ type: "SHOT", item: { idx }, collect: m => ({ isDragging: m.isDragging() }) });
  const [, drop] = useDrop({
    accept: "SHOT",
    hover: (item: any) => { if (item.idx !== idx) { onMove(item.idx, idx); item.idx = idx; } },
  });
  drag(drop(ref));

  return (
    <div
      ref={ref}
      onClick={onSelect}
      className={`glass rounded-xl p-3 flex gap-3 transition cursor-move ${
        isDragging ? "opacity-30" : ""
      } ${isSelected ? "ring-2 ring-cyan-400" : ""}`}
    >
      <div className="flex flex-col items-center gap-1 text-white/50 self-stretch">
        <span className="text-xs cursor-grab">⋮⋮</span>
        <div className="w-8 h-8 rounded-full border border-cyan-400/40 bg-cyan-400/10 flex items-center justify-center text-xs font-bold text-cyan-300">{shot.cut}</div>
        <span className="text-[9px] font-mono text-white/40">{shot.shot_type}</span>
      </div>
      <div
        onClick={(e) => { e.stopPropagation(); shot.image_url ? onPreview() : onGenerate(); }}
        className="flex-shrink-0 w-32 aspect-video rounded-lg bg-slate-800 overflow-hidden cursor-zoom-in"
      >
        {shot.image_url ? <img src={shot.image_url} className="w-full h-full object-cover" alt="" /> :
          isLoading ? <div className="w-full h-full flex items-center justify-center text-xs text-white/40">绘制…</div>
          : <div className="w-full h-full flex items-center justify-center text-2xl text-white/30">🖼</div>
        }
      </div>
      <div className="flex-1 min-w-0 space-y-1.5" onClick={(e) => e.stopPropagation()}>
        <input value={shot.scene} onChange={(e) => onUpdate("scene", e.target.value)}
          className="bg-transparent w-full text-sm font-medium text-white outline-none focus:bg-white/[0.05] rounded px-1" />
        <textarea value={shot.action} onChange={(e) => onUpdate("action", e.target.value)} rows={2}
          className="w-full bg-transparent text-xs text-white/80 outline-none focus:bg-white/[0.05] rounded p-1 resize-none" />
      </div>
      <div className="flex flex-col items-end gap-2">
        <span className="text-amber-300 text-sm font-mono font-bold">
          {((Number(shot.duration_sec) || 0) + (Number(shot.duration_frames) || 0) / 24).toFixed(1)}s
        </span>
        <div className="flex gap-1">
          <IconBtn onClick={onGenerate} title="重绘">🎨</IconBtn>
          <IconBtn onClick={onRemove} title="删除" danger>✕</IconBtn>
        </div>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, title, danger }: any) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }} title={title}
      className={`w-6 h-6 rounded text-xs transition ${
        danger ? "text-white/40 hover:text-red-300 hover:bg-red-400/15" : "text-white/50 hover:text-white hover:bg-white/10"
      }`}>{children}</button>
  );
}
