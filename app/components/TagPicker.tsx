"use client";
import { useState } from "react";
import { TAG_LIBRARY, COMBO_TEMPLATES } from "../lib/tagLibrary";

interface Props {
  selected: string[];
  onChange: (ids: string[]) => void;
}

export default function TagPicker({ selected, onChange }: Props) {
  const [activeCat, setActiveCat] = useState<string>(TAG_LIBRARY[0].key);
  const [open, setOpen] = useState(true);
  const [showCombos, setShowCombos] = useState(true);

  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter(x => x !== id));
    else onChange([...selected, id]);
  };

  const clear = () => onChange([]);

  const applyCombo = (tagIds: string[], merge: boolean) => {
    if (merge) {
      // 合并:并集
      const set = new Set([...selected, ...tagIds]);
      onChange(Array.from(set));
    } else {
      // 替换
      onChange(tagIds);
    }
  };

  const currentCat = TAG_LIBRARY.find(c => c.key === activeCat)!;
  const allTags = TAG_LIBRARY.flatMap(c => c.tags);
  const selectedTags = allTags.filter(t => selected.includes(t.id));

  // 检测当前组合是否完全匹配某个模板
  const matchedCombo = COMBO_TEMPLATES.find(c =>
    c.tagIds.length === selected.length &&
    c.tagIds.every(id => selected.includes(id))
  );

  return (
    <div className="border border-white/10 rounded-2xl bg-white/[0.02] overflow-hidden">
      {/* 头部 */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.03] transition"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🎬</span>
          <div className="text-left">
            <div className="text-sm font-medium text-white">
              电影感预设库 · Cinematic Preset Library
            </div>
            <div className="text-[11px] text-white/40 mt-0.5">
              5 大类 60+ 标签 · 12 个导演级组合模板 · 自动注入 AI 出图
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {matchedCombo && (
            <span className="px-2.5 py-1 rounded-full bg-emerald-400/15 border border-emerald-400/30 text-[11px] text-emerald-300">
              {matchedCombo.icon} {matchedCombo.cn}
            </span>
          )}
          {selected.length > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-cyan-400/15 border border-cyan-400/30 text-[11px] text-cyan-300 font-mono">
              已选 {selected.length}
            </span>
          )}
          <span className="text-white/40 text-sm transition" style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
        </div>
      </button>

      {open && (
        <div className="border-t border-white/5">
          {/* ============ 组合模板区 ============ */}
          <div className="p-5 border-b border-white/5 bg-gradient-to-br from-purple-500/[0.04] to-cyan-400/[0.04]">
            <button
              onClick={() => setShowCombos(!showCombos)}
              className="flex items-center justify-between w-full mb-3"
            >
              <div className="flex items-center gap-2">
                <span className="text-base">⚡</span>
                <span className="text-sm font-medium text-white">导演组合模板 · Director Combos</span>
                <span className="text-[10px] text-white/40">({COMBO_TEMPLATES.length})</span>
              </div>
              <span className="text-white/40 text-xs" style={{ transform: showCombos ? "rotate(180deg)" : "rotate(0)" }}>▾</span>
            </button>

            {showCombos && (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {COMBO_TEMPLATES.map(combo => {
                    const isMatched = matchedCombo?.id === combo.id;
                    return (
                      <div
                        key={combo.id}
                        className={`group relative rounded-xl border transition cursor-pointer overflow-hidden ${
                          isMatched
                            ? "bg-gradient-to-br from-emerald-500/20 to-cyan-400/20 border-emerald-400/60"
                            : "bg-white/[0.02] border-white/10 hover:border-purple-300/40 hover:bg-white/[0.04]"
                        }`}
                        onClick={() => applyCombo(combo.tagIds, false)}
                      >
                        <div className="p-3">
                          <div className="flex items-start gap-2">
                            <span className="text-xl">{combo.icon}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-white truncate">
                                {combo.cn}
                              </div>
                              <div className="text-[10px] text-white/40 font-mono truncate">{combo.en}</div>
                            </div>
                            {isMatched && <span className="text-emerald-300 text-xs">✓</span>}
                          </div>
                          <div className="text-[10px] text-white/45 mt-2 leading-relaxed line-clamp-2">
                            {combo.desc}
                          </div>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {combo.tagIds.slice(0, 3).map(id => {
                              const tag = allTags.find(t => t.id === id);
                              return tag ? (
                                <span key={id} className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-white/60">
                                  {tag.cn}
                                </span>
                              ) : null;
                            })}
                            {combo.tagIds.length > 3 && (
                              <span className="text-[9px] px-1.5 py-0.5 text-white/40">+{combo.tagIds.length - 3}</span>
                            )}
                          </div>
                        </div>
                        {/* hover 显示并入按钮 */}
                        <button
                          onClick={(e) => { e.stopPropagation(); applyCombo(combo.tagIds, true); }}
                          className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-cyan-400/30 text-[9px] text-cyan-100 opacity-0 group-hover:opacity-100 transition hover:bg-cyan-400/50"
                          title="并入当前选择(不清空)"
                        >
                          + 并入
                        </button>
                      </div>
                    );
                  })}
                </div>
                <div className="text-[10px] text-white/35 mt-3 flex items-center gap-3">
                  <span>💡 点击卡片 = 替换选择 · 悬停「+ 并入」= 叠加选择</span>
                </div>
              </>
            )}
          </div>

          {/* ============ 分类标签区 ============ */}
          <div className="p-5">
            {/* 分类切换 */}
            <div className="flex gap-2 mb-4 border-b border-white/5 -mx-5 px-5 pb-3 overflow-x-auto">
              {TAG_LIBRARY.map(cat => {
                const count = cat.tags.filter(t => selected.includes(t.id)).length;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCat(cat.key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm whitespace-nowrap transition ${
                      activeCat === cat.key
                        ? "bg-gradient-to-r from-blue-500/30 to-cyan-400/30 border border-cyan-400/40 text-white"
                        : "border border-white/10 text-white/60 hover:text-white hover:border-white/25"
                    }`}
                  >
                    <span>{cat.icon}</span>
                    <span>{cat.cn}</span>
                    <span className="text-[10px] text-white/40 font-mono">{cat.en}</span>
                    {count > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-cyan-400/30 text-[10px] text-cyan-100">{count}</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* 标签 */}
            <div className="flex flex-wrap gap-2">
              {currentCat.tags.map(tag => {
                const active = selected.includes(tag.id);
                return (
                  <button
                    key={tag.id}
                    onClick={() => toggle(tag.id)}
                    title={tag.desc + " · " + tag.prompt}
                    className={`relative px-3 py-2 rounded-lg text-xs transition flex flex-col items-start text-left min-w-[140px] ${
                      active
                        ? "bg-gradient-to-br from-blue-500/30 to-cyan-400/20 border border-cyan-400/60 text-white shadow-lg shadow-cyan-500/10"
                        : "bg-white/[0.02] border border-white/10 text-white/70 hover:border-white/30 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className="font-medium flex items-center gap-1.5">
                      {active && <span className="text-cyan-300">✓</span>}
                      {tag.cn}
                    </span>
                    <span className="text-[10px] text-white/40 font-mono mt-0.5">{tag.en}</span>
                    {tag.desc && <span className="text-[10px] text-white/35 mt-1">{tag.desc}</span>}
                  </button>
                );
              })}
            </div>

            {/* 已选 chips */}
            {selectedTags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-[11px] text-white/50 uppercase tracking-wider">
                    已选预设 · Selected ({selectedTags.length})
                  </div>
                  <button onClick={clear} className="text-[11px] text-red-300/70 hover:text-red-300 transition">
                    清空 Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map(t => {
                    const cat = TAG_LIBRARY.find(c => c.tags.some(tt => tt.id === t.id));
                    return (
                      <span key={t.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-400/10 border border-cyan-400/30 text-[11px] text-cyan-100">
                        <span className="text-white/40">{cat?.icon}</span>
                        {t.cn}
                        <button onClick={() => toggle(t.id)} className="text-cyan-300/60 hover:text-white">✕</button>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
