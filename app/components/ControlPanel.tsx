"use client";
import { useState } from "react";
import { WORKSPACE_TABS } from "../lib/workspaceTabs";
import ConfigTab from "./tabs/ConfigTab";
import CharactersTab from "./tabs/CharactersTab";
import AssetsTab from "./tabs/AssetsTab";
import HistoryTab from "./tabs/HistoryTab";
import StatsTab from "./tabs/StatsTab";
import AITab from "./tabs/AITab";
import { Shot } from "./StoryboardTable";
import { Snapshot } from "../lib/historyStore";

export interface PanelState {
  story: string;
  style: string;
  duration: number;
  aspectRatio: "smart" | "9:16" | "1:1" | "16:9";
  quality: "normal" | "high";
  presetTags: string[];
  shotsCount: number;
}

interface Props {
  state: PanelState;
  setState: (s: Partial<PanelState>) => void;
  onGenerate: () => void;
  loading: boolean;
  hasShots: boolean;
  projectId: string;
  shots: Shot[];
  onShotsChange: (s: Shot[]) => void;
  onPreviewShot: (idx: number) => void;
  onRestoreSnapshot: (s: Snapshot) => void;
  historyRefreshKey: number;
}

export default function ControlPanel(p: Props) {
  const [activeTab, setActiveTab] = useState("config");

  return (
    <aside className="w-full lg:w-[460px] xl:w-[500px] flex-shrink-0 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-20 flex border-r border-white/5 bg-gradient-to-b from-black/30 to-black/10">
      {/* Tab 栏 */}
      <div className="w-16 flex-shrink-0 border-r border-white/5 bg-black/40 flex flex-col items-center py-3 gap-1">
        {WORKSPACE_TABS.map(t => {
          const active = activeTab === t.id;
          let badge: number | null = null;
          if (t.id === "assets") badge = p.shots.filter(s => s.image_url).length || null;
          if (t.id === "config" && p.state.presetTags.length > 0) badge = p.state.presetTags.length;

          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative w-12 h-12 rounded-xl flex flex-col items-center justify-center transition group ${
                active
                  ? "bg-gradient-to-br from-blue-500/30 to-cyan-400/30 text-white shadow-lg shadow-cyan-500/10"
                  : "text-white/50 hover:text-white hover:bg-white/[0.05]"
              }`}
              title={t.cn + " · " + t.desc}
            >
              <span className="text-lg leading-none">{t.icon}</span>
              <span className="text-[9px] mt-0.5 font-medium">{t.cn}</span>
              {active && <span className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r bg-cyan-400" />}
              {badge && (
                <span className="absolute top-1 right-1 min-w-[16px] h-4 rounded-full px-1 bg-cyan-400 text-black text-[9px] font-bold flex items-center justify-center">
                  {badge}
                </span>
              )}
              {t.id === "ai" && (
                <span className="absolute -top-0.5 -right-0.5 px-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[7px] font-bold">NEW</span>
              )}
            </button>
          );
        })}

        <div className="flex-1" />

        <button
          onClick={() => {
            if (!confirm("重置全部设置?")) return;
            p.setState({
              story: "", style: "电影感 / Cinematic", duration: 30,
              aspectRatio: "16:9", quality: "high", presetTags: [], shotsCount: 6,
            });
          }}
          className="w-12 h-12 rounded-xl text-white/40 hover:text-white hover:bg-white/[0.05] flex flex-col items-center justify-center transition"
          title="重置"
        >
          <span className="text-base">🔄</span>
          <span className="text-[9px] mt-0.5">重置</span>
        </button>
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-black/15">
          <span className="text-lg">{WORKSPACE_TABS.find(t => t.id === activeTab)?.icon}</span>
          <div className="flex-1">
            <div className="text-sm font-semibold text-white">
              {WORKSPACE_TABS.find(t => t.id === activeTab)?.cn}
              {activeTab === "ai" && <span className="ml-2 text-[9px] px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-200">BETA</span>}
            </div>
            <div className="text-[10px] text-white/40">
              {WORKSPACE_TABS.find(t => t.id === activeTab)?.desc}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scroll p-5 fade-up" key={activeTab}>
          {activeTab === "config" && <ConfigTab state={p.state} setState={p.setState} />}
          {activeTab === "ai" && <AITab shots={p.shots} onApply={p.onShotsChange} />}
          {activeTab === "characters" && <CharactersTab projectId={p.projectId} />}
          {activeTab === "assets" && <AssetsTab shots={p.shots} onPreview={p.onPreviewShot} />}
          {activeTab === "history" && (
            <HistoryTab projectId={p.projectId} onRestore={p.onRestoreSnapshot} refreshKey={p.historyRefreshKey} />
          )}
          {activeTab === "stats" && (
            <StatsTab shots={p.shots} presetTags={p.state.presetTags}
              duration={p.state.duration} shotsCount={p.state.shotsCount} />
          )}
        </div>

        {activeTab === "config" && (
          <div className="border-t border-white/5 p-4 bg-gradient-to-t from-black/60 to-transparent">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 text-[10px] text-white/40">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>预计 ~{Math.max(5, Math.round(p.state.shotsCount * 1.5))} 秒</span>
                </div>
              </div>
              <kbd className="text-[10px] px-1.5 py-0.5 rounded border border-white/10 text-white/40 font-mono">⌘G</kbd>
            </div>
            <button
              onClick={p.onGenerate}
              disabled={p.loading || !p.state.story.trim()}
              className="w-full py-3.5 rounded-xl font-semibold text-base transition disabled:opacity-40 disabled:cursor-not-allowed bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:shadow-lg hover:shadow-cyan-500/40 active:scale-[0.98]"
            >
              {p.loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  生成中…
                </span>
              ) : p.hasShots ? "🔄 重新生成" : "🚀 生成分镜"}
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
