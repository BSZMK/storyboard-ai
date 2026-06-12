"use client";
import { useState } from "react";
import { SCRIPT_CATEGORIES, SCRIPT_TEMPLATES, getTemplatesByCategory, ScriptTemplate } from "../lib/scriptTemplates";

interface Props {
  onApply: (t: ScriptTemplate) => void;
}

export default function ScriptLibrary({ onApply }: Props) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("all");
  const list = getTemplatesByCategory(cat);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-ghost text-sm"
        title="从剧本库挑选模板"
      >
        🎲 剧本库 · Templates
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md bg-black/70 fade-up" onClick={() => setOpen(false)}>
          <div
            className="relative w-full max-w-6xl max-h-[88vh] glass rounded-3xl overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <div>
                <div className="text-xs font-mono tracking-widest text-cyan-300/80 mb-1">— SCRIPT LIBRARY —</div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  剧本<span className="text-gradient">模板库</span>
                </h2>
                <p className="text-sm text-white/45 mt-1">{SCRIPT_TEMPLATES.length} 个精选模板 · 一键应用 · 含推荐预设</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/10 transition flex items-center justify-center text-xl text-white/60">✕</button>
            </div>

            {/* 分类 */}
            <div className="flex gap-2 px-6 py-4 border-b border-white/5 overflow-x-auto">
              {SCRIPT_CATEGORIES.map(c => {
                const count = c.key === "all" ? SCRIPT_TEMPLATES.length : SCRIPT_TEMPLATES.filter(t => t.category === c.key).length;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCat(c.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                      cat === c.key
                        ? "bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-cyan-400/40 text-white"
                        : "border border-white/10 text-white/60 hover:text-white hover:border-white/25"
                    }`}
                  >
                    <span>{c.icon}</span>
                    <span>{c.cn}</span>
                    <span className="text-[10px] text-white/40 font-mono">{c.en}</span>
                    <span className="ml-1 px-1.5 py-0.5 rounded-full bg-white/5 text-[10px] text-white/50">{count}</span>
                  </button>
                );
              })}
            </div>

            {/* 模板网格 */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.map(t => (
                <div
                  key={t.id}
                  className="group glass rounded-2xl p-5 hover:border-cyan-400/40 transition cursor-pointer"
                  onClick={() => { onApply(t); setOpen(false); }}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 to-cyan-400/30 flex items-center justify-center text-2xl">
                      {t.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-white truncate">{t.cn}</h3>
                      <p className="text-[11px] text-white/40 font-mono">{t.en}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/55 italic mt-3">{t.desc}</p>
                  <p className="text-xs text-white/70 mt-3 line-clamp-3 leading-relaxed">{t.story}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <span>⏱ {t.duration}s</span>
                      <span>·</span>
                      <span>{t.style.split(" /")[0]}</span>
                    </div>
                    {t.recommendedTags && (
                      <span className="text-[10px] text-cyan-300/80">🎬 {t.recommendedTags.length} 预设</span>
                    )}
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 transition mt-3 -mb-1 text-center text-[11px] text-cyan-300">
                    点击应用 → Apply
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-white/5 text-center text-[11px] text-white/35">
              💡 选择模板会自动填入剧情、风格、时长 · 含推荐预设标签
            </div>
          </div>
        </div>
      )}
    </>
  );
}
