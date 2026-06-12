"use client";
import { useEffect, useState } from "react";
import { Asset, listAssets, saveAssets, newId } from "../lib/assetStore";
import { useToast } from "./Toast";

interface Props {
  projectId: string;
}

const ASSET_TYPES = [
  { v: "image" as const, label: "参考图", icon: "🖼", color: "from-blue-500/30 to-cyan-400/30" },
  { v: "music" as const, label: "音乐", icon: "🎵", color: "from-purple-500/30 to-pink-400/30" },
  { v: "prop" as const, label: "道具", icon: "🎭", color: "from-amber-500/30 to-orange-400/30" },
  { v: "scene" as const, label: "场景", icon: "🏞", color: "from-emerald-500/30 to-teal-400/30" },
  { v: "note" as const, label: "灵感", icon: "💡", color: "from-yellow-500/30 to-amber-400/30" },
];

export default function AssetPanel({ projectId }: Props) {
  const toast = useToast();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filter, setFilter] = useState<Asset["type"] | "all">("all");
  const [editing, setEditing] = useState<Asset | null>(null);

  useEffect(() => { setAssets(listAssets(projectId)); }, [projectId]);

  const persist = (next: Asset[]) => {
    setAssets(next);
    saveAssets(projectId, next);
  };

  const addAsset = (type: Asset["type"]) => {
    const labels = { image: "新参考图", music: "新音乐", prop: "新道具", scene: "新场景", note: "新灵感" };
    const a: Asset = {
      id: newId("a"),
      type,
      name: labels[type],
      desc: "",
      tags: [],
    };
    persist([...assets, a]);
    setEditing(a);
  };

  const updateAsset = (id: string, patch: Partial<Asset>) => {
    const next = assets.map(a => a.id === id ? { ...a, ...patch } : a);
    persist(next);
    if (editing?.id === id) setEditing({ ...editing, ...patch });
  };

  const removeAsset = (id: string) => {
    if (!confirm("删除该资产?")) return;
    persist(assets.filter(a => a.id !== id));
    if (editing?.id === id) setEditing(null);
    toast.show("已删除", "info");
  };

  const handleImageUpload = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      updateAsset(id, { url: e.target?.result as string });
      toast.show("已上传图片", "success");
    };
    reader.readAsDataURL(file);
  };

  const filtered = filter === "all" ? assets : assets.filter(a => a.type === filter);
  const counts: any = { all: assets.length };
  ASSET_TYPES.forEach(t => { counts[t.v] = assets.filter(a => a.type === t.v).length; });

  return (
    <div className="p-5 space-y-4">
      <div>
        <div className="text-sm font-medium text-white">资产库</div>
        <div className="text-[11px] text-white/45">{assets.length} 个素材 · 参考图/音乐/道具/灵感板</div>
      </div>

      {/* 类型筛选 */}
      <div className="flex flex-wrap gap-1.5">
        <FilterTab active={filter === "all"} onClick={() => setFilter("all")} icon="📋" label="全部" count={counts.all} />
        {ASSET_TYPES.map(t => (
          <FilterTab key={t.v} active={filter === t.v} onClick={() => setFilter(t.v)} icon={t.icon} label={t.label} count={counts[t.v]} />
        ))}
      </div>

      {/* 快捷新增 */}
      <div className="grid grid-cols-5 gap-1.5">
        {ASSET_TYPES.map(t => (
          <button
            key={t.v}
            onClick={() => addAsset(t.v)}
            className={`p-2.5 rounded-lg border border-white/10 hover:border-cyan-400/40 bg-gradient-to-br ${t.color} hover:scale-105 transition group`}
            title={`添加${t.label}`}
          >
            <div className="text-lg">{t.icon}</div>
            <div className="text-[9px] text-white/70 mt-0.5">+ {t.label}</div>
          </button>
        ))}
      </div>

      {/* 列表 */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-xl border border-dashed border-white/15 text-center">
          <div className="text-3xl mb-2 opacity-40">📦</div>
          <div className="text-xs text-white/40">暂无资产,点击上方按钮添加</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(a => {
            const meta = ASSET_TYPES.find(t => t.v === a.type)!;
            return (
              <div
                key={a.id}
                onClick={() => setEditing(editing?.id === a.id ? null : a)}
                className={`rounded-xl border transition cursor-pointer overflow-hidden ${
                  editing?.id === a.id
                    ? "border-cyan-400/60 bg-cyan-400/[0.06]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <div className="flex items-center gap-3 p-3">
                  {a.type === "image" && a.url ? (
                    <img src={a.url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl bg-gradient-to-br ${meta.color}`}>
                      {meta.icon}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-white truncate">{a.name}</div>
                    <div className="text-[11px] text-white/45 truncate">
                      <span className="px-1.5 py-0.5 rounded bg-white/10 mr-1">{meta.label}</span>
                      {a.desc || "暂无描述"}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeAsset(a.id); }}
                    className="w-6 h-6 rounded text-white/30 hover:text-red-400 hover:bg-red-400/10 transition text-xs"
                  >
                    ✕
                  </button>
                </div>

                {editing?.id === a.id && (
                  <div className="px-3 pb-3 border-t border-white/5 pt-3 space-y-2.5 fade-up" onClick={(e) => e.stopPropagation()}>
                    <input
                      value={a.name}
                      onChange={(e) => updateAsset(a.id, { name: e.target.value })}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400/40"
                      placeholder="名称"
                    />
                    <textarea
                      value={a.desc}
                      onChange={(e) => updateAsset(a.id, { desc: e.target.value })}
                      rows={2}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400/40 resize-none"
                      placeholder="描述..."
                    />
                    {a.type === "image" && (
                      <div>
                        {a.url && <img src={a.url} alt="" className="w-full rounded-lg mb-2 max-h-40 object-cover" />}
                        <label className="block w-full py-2 rounded-lg border border-dashed border-white/20 hover:border-cyan-400/40 text-center text-xs text-white/60 hover:text-cyan-300 cursor-pointer transition">
                          📷 {a.url ? "更换图片" : "上传图片"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => e.target.files?.[0] && handleImageUpload(a.id, e.target.files[0])}
                          />
                        </label>
                      </div>
                    )}
                    {(a.type === "music" || a.type === "prop" || a.type === "scene") && (
                      <input
                        value={a.url || ""}
                        onChange={(e) => updateAsset(a.id, { url: e.target.value })}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400/40"
                        placeholder={a.type === "music" ? "🎵 音乐 URL 或 Spotify 链接" : "🔗 参考链接"}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function FilterTab({ active, onClick, icon, label, count }: { active: boolean; onClick: () => void; icon: string; label: string; count: number; }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] transition ${
        active
          ? "bg-cyan-400/20 border border-cyan-400/40 text-cyan-100"
          : "bg-white/[0.04] border border-white/10 text-white/55 hover:text-white"
      }`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      {count > 0 && <span className="text-[9px] opacity-70">{count}</span>}
    </button>
  );
}
