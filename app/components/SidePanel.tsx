"use client";
import { useState } from "react";
import ControlPanel, { PanelState } from "./ControlPanel";
import CharacterPanel from "./CharacterPanel";
import AssetPanel from "./AssetPanel";
import { listCharacters } from "../lib/characterStore";
import { listAssets } from "../lib/characterStore";
import { useEffect } from "react";

interface Props {
  projectId: string;
  state: PanelState;
  setState: (s: Partial<PanelState>) => void;
  onGenerate: () => void;
  loading: boolean;
  hasShots: boolean;
}

type Tab = "storyboard" | "characters" | "assets";

const TABS = [
  { v: "storyboard" as const, label: "分镜", en: "Storyboard", icon: "📋" },
  { v: "characters" as const, label: "角色", en: "Characters", icon: "👥" },
  { v: "assets" as const, label: "资产", en: "Assets", icon: "📦" },
];

export default function SidePanel({ projectId, state, setState, onGenerate, loading, hasShots }: Props) {
  const [tab, setTab] = useState<Tab>("storyboard");
  const [charCount, setCharCount] = useState(0);
  const [assetCount, setAssetCount] = useState(0);

  // 实时统计数量(切换 Tab 时刷新)
  useEffect(() => {
    setCharCount(listCharacters(projectId).length);
    setAssetCount(listAssets(projectId).length);
  }, [projectId, tab]);

  return (
    <aside className="w-full lg:w-[400px] xl:w-[440px] flex-shrink-0 lg:h-[calc(100vh-5rem)] lg:sticky lg:top-20 flex flex-col border-r border-white/5 bg-black/20">
      {/* Tab Bar */}
      <div className="flex border-b border-white/5 bg-black/40">
        {TABS.map(t => {
          const active = tab === t.v;
          const count = t.v === "characters" ? charCount : t.v === "assets" ? assetCount : 0;
          return (
            <button
              key={t.v}
              onClick={() => setTab(t.v)}
              className={`flex-1 px-3 py-3 transition relative group ${
                active ? "text-white" : "text-white/45 hover:text-white/80"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-base">{t.icon}</span>
                <div className="text-left">
                  <div className="text-xs font-semibold leading-tight">{t.label}</div>
                  <div className="text-[9px] text-white/40 font-mono leading-tight">{t.en}</div>
                </div>
                {count > 0 && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono ${
                    active ? "bg-cyan-400/30 text-cyan-100" : "bg-white/10 text-white/60"
                  }`}>
                    {count}
                  </span>
                )}
              </div>
              {active && (
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-12 h-0.5 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 内容 */}
      <div className="flex-1 overflow-y-auto custom-scroll">
        {tab === "storyboard" && (
          <ControlPanel
            state={state}
            setState={setState}
            onGenerate={onGenerate}
            loading={loading}
            hasShots={hasShots}
            embedded
          />
        )}
        {tab === "characters" && <CharacterPanel projectId={projectId} />}
        {tab === "assets" && <AssetPanel projectId={projectId} />}
      </div>

      {/* 底部生成按钮(仅在分镜 Tab 时显示,放在 ControlPanel 内) */}
      {tab !== "storyboard" && (
        <div className="border-t border-white/5 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <button
            onClick={() => setTab("storyboard")}
            className="w-full py-3 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 border border-white/10 text-white transition flex items-center justify-center gap-2"
          >
            ← 返回分镜配置
          </button>
        </div>
      )}
    </aside>
  );
}
