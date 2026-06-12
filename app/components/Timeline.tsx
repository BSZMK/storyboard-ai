"use client";
import { useRef, useState, useEffect } from "react";
import { Shot } from "./StoryboardTable";

interface Props {
  shots: Shot[];
  onChange: (shots: Shot[]) => void;
  onSelect?: (idx: number) => void;
  selectedIdx?: number | null;
  collapsed: boolean;
  onToggle: () => void;
}

const PX_PER_SEC = 24; // 1 秒 = 24px(默认)

export default function Timeline({ shots, onChange, onSelect, selectedIdx, collapsed, onToggle }: Props) {
  const [zoom, setZoom] = useState(1);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scale = PX_PER_SEC * zoom;

  const getSec = (s: Shot) => (Number(s.duration_sec) || 0) + (Number(s.duration_frames) || 0) / 24;
  const totalSec = shots.reduce((a, s) => a + getSec(s), 0);
  const playhead = shots.slice(0, (selectedIdx ?? -1) + 1).reduce((a, s) => a + getSec(s), 0);

  const handleResize = (idx: number, startX: number, startSec: number) => {
    setDraggingIdx(idx);
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const newSec = Math.max(0.5, startSec + dx / scale);
      const next = [...shots];
      const whole = Math.floor(newSec);
      const frames = Math.round((newSec - whole) * 24);
      next[idx] = { ...next[idx], duration_sec: whole, duration_frames: frames };
      onChange(next);
    };
    const onUp = () => {
      setDraggingIdx(null);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  // 刻度
  const ticks = Math.ceil(totalSec) + 5;

  if (collapsed) {
    return (
      <div className="border-t border-white/5 bg-black/40 backdrop-blur px-4 py-2 flex items-center gap-3">
        <button onClick={onToggle} className="text-xs text-white/60 hover:text-white flex items-center gap-1.5">
          🎞 <span>展开时间线</span> ▴
        </button>
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden flex">
          {shots.map((s, i) => (
            <div
              key={i}
              className={`h-full ${
                selectedIdx === i ? "bg-cyan-300" : i % 2 === 0 ? "bg-cyan-500/50" : "bg-blue-500/50"
              } border-r border-black/20`}
              style={{ flex: getSec(s) }}
            />
          ))}
        </div>
        <span className="text-[10px] text-white/40 font-mono">{shots.length} cuts · {totalSec.toFixed(1)}s</span>
      </div>
    );
  }

  return (
    <div className="border-t border-white/5 bg-gradient-to-b from-black/50 to-black/70 backdrop-blur">
      {/* 工具栏 */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-white/5">
        <button onClick={onToggle} className="text-xs text-white/60 hover:text-white flex items-center gap-1.5">
          🎞 <span className="font-medium text-white">时间线</span> ▾
        </button>
        <span className="text-[11px] text-white/40 font-mono">
          {shots.length} cuts · {totalSec.toFixed(1)}s · 总帧 {Math.round(totalSec * 24)}f
        </span>

        <div className="flex-1" />

        <div className="flex items-center gap-1 text-[10px] text-white/40">
          <span>缩放</span>
          <button onClick={() => setZoom(z => Math.max(0.3, z - 0.2))} className="w-6 h-6 rounded hover:bg-white/10 text-white/60">−</button>
          <span className="w-10 text-center font-mono text-white/70">{(zoom * 100).toFixed(0)}%</span>
          <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} className="w-6 h-6 rounded hover:bg-white/10 text-white/60">+</button>
          <button onClick={() => setZoom(1)} className="ml-1 text-[10px] text-white/40 hover:text-white">重置</button>
        </div>
      </div>

      {/* 时间线主体 */}
      <div ref={scrollRef} className="overflow-x-auto custom-scroll">
        <div className="relative" style={{ minWidth: ticks * scale + 80, padding: "8px 40px 12px 40px" }}>
          {/* 时间刻度 */}
          <div className="relative h-5 mb-1 select-none">
            {Array.from({ length: ticks }).map((_, i) => (
              <div key={i} className="absolute top-0 flex flex-col items-start" style={{ left: i * scale }}>
                <div className={`w-px ${i % 5 === 0 ? "h-3 bg-white/30" : "h-1.5 bg-white/15"}`} />
                {i % 5 === 0 && (
                  <span className="text-[9px] text-white/40 font-mono ml-0.5">{i}s</span>
                )}
              </div>
            ))}
            {/* 播放头 */}
            {selectedIdx !== null && selectedIdx !== undefined && (
              <div
                className="absolute top-0 bottom-[-80px] w-px bg-cyan-300 pointer-events-none z-10"
                style={{ left: playhead * scale }}
              >
                <div className="w-2 h-2 -ml-[3px] -mt-1 rotate-45 bg-cyan-300" />
              </div>
            )}
          </div>

          {/* 片段轨道 */}
          <div className="relative flex h-16 rounded-lg overflow-visible bg-white/[0.02] border border-white/5">
            {shots.map((s, i) => {
              const w = getSec(s) * scale;
              const active = selectedIdx === i;
              const dragging = draggingIdx === i;
              return (
                <div
                  key={i}
                  onClick={() => onSelect?.(i)}
                  className={`group relative flex-shrink-0 h-full border-r border-black/30 cursor-pointer transition ${
                    active
                      ? "bg-gradient-to-br from-cyan-500/40 to-blue-500/40 ring-2 ring-cyan-300 z-10"
                      : i % 2 === 0
                      ? "bg-gradient-to-br from-cyan-500/15 to-blue-500/15 hover:from-cyan-500/25 hover:to-blue-500/25"
                      : "bg-gradient-to-br from-purple-500/15 to-pink-500/15 hover:from-purple-500/25 hover:to-pink-500/25"
                  } ${dragging ? "z-20" : ""}`}
                  style={{ width: Math.max(40, w) }}
                  title={`#${s.cut} · ${s.scene} · ${getSec(s).toFixed(1)}s`}
                >
                  {/* 缩略图 */}
                  {s.image_url && w > 60 && (
                    <img src={s.image_url} className="absolute inset-1 rounded object-cover opacity-50" style={{ width: w - 8, height: 56 }} alt="" />
                  )}
                  <div className="relative h-full flex flex-col justify-between p-1.5 pointer-events-none">
                    <div className="flex items-center gap-1 text-[9px] text-white/90 font-mono">
                      <span className="px-1 rounded bg-black/60">#{s.cut}</span>
                      {w > 70 && <span className="px-1 rounded bg-black/40">{s.shot_type}</span>}
                    </div>
                    {w > 50 && (
                      <div className="text-[9px] text-white/80 font-mono drop-shadow">
                        {getSec(s).toFixed(1)}s
                      </div>
                    )}
                  </div>

                  {/* 拖拽手柄(右边缘) */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResize(i, e.clientX, getSec(s));
                    }}
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/0 hover:bg-cyan-300 group-hover:bg-cyan-300/50 transition"
                  />

                  {dragging && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-cyan-400 text-black text-[10px] font-mono font-bold whitespace-nowrap">
                      {getSec(s).toFixed(1)}s
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {shots.length === 0 && (
            <div className="text-center py-4 text-xs text-white/30">尚未生成分镜</div>
          )}
        </div>
      </div>

      <div className="px-4 py-1.5 text-[10px] text-white/30 border-t border-white/5 flex items-center justify-between">
        <span>💡 拖拽片段右边缘调整时长 · 点击片段选中</span>
        <span className="font-mono">{PX_PER_SEC * zoom}px / 秒</span>
      </div>
    </div>
  );
}
