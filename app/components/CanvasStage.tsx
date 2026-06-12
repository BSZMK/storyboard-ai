"use client";
import { useState } from "react";
import { Shot } from "./StoryboardTable";
import DraggableStoryboard from "./DraggableStoryboard";
import Timeline from "./Timeline";

interface Props {
  shots: Shot[];
  onShotsChange: (s: Shot[]) => void;
  presetTags: string[];
  loading: boolean;
  onPreviewShot: (idx: number) => void;
}

export default function CanvasStage({ shots, onShotsChange, presetTags, loading, onPreviewShot }: Props) {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [tlCollapsed, setTlCollapsed] = useState(false);

  if (shots.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full text-center">
          {loading ? (
            <div className="space-y-6">
              <div className="relative w-24 h-24 mx-auto">
                <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-400 animate-spin" />
                <div className="absolute inset-3 rounded-full bg-gradient-to-br from-blue-500/30 to-cyan-400/30 flex items-center justify-center text-3xl">🎬</div>
              </div>
              <div>
                <div className="text-xl font-semibold text-white mb-1">AI 正在拆解剧情</div>
                <div className="text-sm text-white/50">分析叙事节奏 · 设计镜头语言…</div>
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                {["📖 解析剧情结构", "🎯 划分关键节点", "🎥 设计镜头序列", "✨ 优化节奏感"].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-white/60 fade-up" style={{ animationDelay: `${i * 0.3}s` }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />{s}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 fade-up">
              <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-blue-500/20 to-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-6xl">🎬</div>
              <div>
                <h3 className="text-3xl font-semibold tracking-tight text-white">
                  开始你的<span className="text-gradient">分镜创作</span>
                </h3>
                <p className="text-white/50 mt-3">
                  在左侧填写剧情 → 选择风格 → 点击 <span className="text-cyan-300 font-semibold">「🚀 生成分镜」</span>
                </p>
                <p className="text-white/40 text-xs mt-3">
                  💡 切到 [🤖 AI 助手] 也可以用自然语言直接修改分镜
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                {[
                  { icon: "🎲", t: "剧本库", d: "15+ 模板" },
                  { icon: "🎬", t: "60+ 预设", d: "电影级标签" },
                  { icon: "🖼", t: "AI 出图", d: "万相 WanX" },
                ].map(c => (
                  <div key={c.t} className="glass rounded-xl p-3">
                    <div className="text-2xl mb-1">{c.icon}</div>
                    <div className="text-xs font-semibold text-white">{c.t}</div>
                    <div className="text-[10px] text-white/40">{c.d}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto custom-scroll">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <DraggableStoryboard
            shots={shots}
            onChange={onShotsChange}
            presetTagIds={presetTags}
            onPreview={onPreviewShot}
            selectedIdx={selectedIdx}
            onSelect={setSelectedIdx}
          />
        </div>
      </div>
      <Timeline
        shots={shots}
        onChange={onShotsChange}
        selectedIdx={selectedIdx}
        onSelect={setSelectedIdx}
        collapsed={tlCollapsed}
        onToggle={() => setTlCollapsed(!tlCollapsed)}
      />
    </div>
  );
}
