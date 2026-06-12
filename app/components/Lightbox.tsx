"use client";
import { useEffect } from "react";
import { Shot } from "./StoryboardTable";

interface Props {
  shots: Shot[];
  currentIdx: number;
  onClose: () => void;
  onNav: (idx: number) => void;
}

export default function Lightbox({ shots, currentIdx, onClose, onNav }: Props) {
  const shot = shots[currentIdx];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [currentIdx]);

  const next = () => {
    const nextIdx = shots.findIndex((s, i) => i > currentIdx && s.image_url);
    if (nextIdx !== -1) onNav(nextIdx);
  };

  const prev = () => {
    for (let i = currentIdx - 1; i >= 0; i--) {
      if (shots[i].image_url) { onNav(i); return; }
    }
  };

  const downloadCurrent = async () => {
    if (!shot.image_url) return;
    try {
      const res = await fetch(shot.image_url);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `shot-${shot.cut.toString().padStart(2, "0")}.jpg`;
      a.click();
    } catch {
      window.open(shot.image_url, "_blank");
    }
  };

  const downloadAll = async () => {
    const withImg = shots.filter(s => s.image_url);
    if (withImg.length === 0) return;
    if (!confirm(`将依次下载 ${withImg.length} 张图片,请确认浏览器允许多文件下载`)) return;
    for (const s of withImg) {
      try {
        const res = await fetch(s.image_url!);
        const blob = await res.blob();
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `shot-${s.cut.toString().padStart(2, "0")}.jpg`;
        a.click();
        await new Promise(r => setTimeout(r, 300));
      } catch {}
    }
  };

  if (!shot) return null;
  const hasNext = shots.some((s, i) => i > currentIdx && s.image_url);
  const hasPrev = shots.some((s, i) => i < currentIdx && s.image_url);

  return (
    <div className="fixed inset-0 z-[200] backdrop-blur-xl bg-black/85 flex flex-col fade-up" onClick={onClose}>
      {/* 顶部工具栏 */}
      <div className="flex items-center justify-between p-4 md:p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-cyan-400/40 bg-cyan-400/10 flex items-center justify-center text-base font-bold text-cyan-300">
            {shot.cut}
          </div>
          <div>
            <div className="text-white text-sm font-semibold">{shot.scene}</div>
            <div className="text-white/40 text-[11px] font-mono">{shot.shot_type} · {shot.camera} · {shot.duration_sec}s</div>
          </div>
          <div className="px-2 py-1 rounded bg-white/10 text-[10px] text-white/60 font-mono ml-2">
            {currentIdx + 1} / {shots.length}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={downloadCurrent} className="btn-ghost text-xs py-2 px-3">⬇ 下载本张</button>
          <button onClick={downloadAll} className="btn-ghost text-xs py-2 px-3">📦 下载全部</button>
          <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-white/10 transition flex items-center justify-center text-xl text-white/70">✕</button>
        </div>
      </div>

      {/* 主图区 */}
      <div className="flex-1 flex items-center justify-center px-4 md:px-12 relative" onClick={(e) => e.stopPropagation()}>
        {hasPrev && (
          <button onClick={prev} className="absolute left-4 md:left-8 w-12 h-12 rounded-full backdrop-blur bg-white/5 hover:bg-white/15 border border-white/10 transition flex items-center justify-center text-white text-xl z-10">
            ‹
          </button>
        )}
        {shot.image_url ? (
          <img src={shot.image_url} alt="" className="max-h-[75vh] max-w-full rounded-2xl shadow-2xl border border-white/10" />
        ) : (
          <div className="text-white/50">该镜头暂无图片</div>
        )}
        {hasNext && (
          <button onClick={next} className="absolute right-4 md:right-8 w-12 h-12 rounded-full backdrop-blur bg-white/5 hover:bg-white/15 border border-white/10 transition flex items-center justify-center text-white text-xl z-10">
            ›
          </button>
        )}
      </div>

      {/* 底部信息栏 */}
      <div className="p-4 md:p-6 border-t border-white/5 backdrop-blur-md bg-black/30" onClick={(e) => e.stopPropagation()}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">画面 · Action</div>
            <div className="text-white/85 line-clamp-3">{shot.action}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">台词 · Dialogue</div>
            <div className="text-white/85 line-clamp-3">{shot.dialogue}</div>
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1">声音 · Sound</div>
            <div className="text-cyan-200/70 italic line-clamp-3">{shot.sound || "—"}</div>
          </div>
        </div>
        <div className="text-center text-[11px] text-white/30 mt-4">
          ← → 切换 · ESC 关闭
        </div>
      </div>
    </div>
  );
}
