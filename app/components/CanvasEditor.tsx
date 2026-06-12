"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Shot } from "./StoryboardTable";
import ControlPanel, { PanelState } from "./ControlPanel";
import CanvasStage from "./CanvasStage";
import Lightbox from "./Lightbox";
import { getProject, saveProject, newProjectId } from "../lib/projectStore";
import { pushSnapshot, Snapshot } from "../lib/historyStore";
import { useToast } from "./Toast";
import { listCharacters, buildCharacterPrompt } from "../lib/characterStore";

interface Props { projectId: string | null; }

const DEFAULT_STATE: PanelState = {
  story: "一个戴眼镜的青年在便利店收银台前犹豫地拿起一罐咖啡,最后放回原处,转身离开。",
  style: "电影感 / Cinematic",
  duration: 30,
  aspectRatio: "16:9",
  quality: "high",
  presetTags: [],
  shotsCount: 6,
};

export default function CanvasEditor({ projectId }: Props) {
  const toast = useToast();
  const [pid, setPid] = useState<string>(projectId || newProjectId());
  const [name, setName] = useState("未命名项目");
  const [shots, setShots] = useState<Shot[]>([]);
  const [panel, setPanel] = useState<PanelState>(DEFAULT_STATE);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"" | "saving" | "saved">("");
  const [showPanel, setShowPanel] = useState(true);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
  const initRef = useRef(false);

  const setPanelPart = useCallback((s: Partial<PanelState>) => {
    setPanel(prev => ({ ...prev, ...s }));
  }, []);

  useEffect(() => {
    if (projectId) {
      const p = getProject(projectId);
      if (p) {
        setPid(p.id); setName(p.name); setShots(p.shots || []);
        setPanel({
          story: p.story, style: p.style, duration: p.duration,
          aspectRatio: (p as any).aspectRatio || "16:9",
          quality: (p as any).quality || "high",
          presetTags: p.presetTags || [],
          shotsCount: (p as any).shotsCount || 6,
        });
        setTimeout(() => { initRef.current = true; }, 100);
      } else {
        toast.show("项目不存在", "error");
        initRef.current = true;
      }
    } else {
      initRef.current = true;
    }
    // eslint-disable-next-line
  }, [projectId]);

  const persist = useCallback(() => {
    if (!initRef.current) return;
    if (shots.length === 0 && !panel.story.trim()) return;
    setSaveStatus("saving");
    const existing = getProject(pid);
    saveProject({
      id: pid, name,
      story: panel.story, style: panel.style, duration: panel.duration,
      presetTags: panel.presetTags, shots,
      cover: shots.find(s => s.image_url)?.image_url,
      createdAt: existing?.createdAt || Date.now(),
      updatedAt: Date.now(),
      ...{ aspectRatio: panel.aspectRatio, quality: panel.quality, shotsCount: panel.shotsCount } as any,
    });
    setTimeout(() => setSaveStatus("saved"), 200);
    setTimeout(() => setSaveStatus(""), 1500);
  }, [pid, name, panel, shots]);

  useEffect(() => { const t = setTimeout(persist, 800); return () => clearTimeout(t); }, [persist]);

  const lastShotsCountRef = useRef(0);
  const lastImagesCountRef = useRef(0);
  useEffect(() => {
    if (!initRef.current) {
      lastShotsCountRef.current = shots.length;
      lastImagesCountRef.current = shots.filter(s => s.image_url).length;
      return;
    }
    const imageCount = shots.filter(s => s.image_url).length;
    const shotsChanged = shots.length !== lastShotsCountRef.current;
    const imageChanged = imageCount !== lastImagesCountRef.current;

    if (shotsChanged || (imageChanged && imageCount > lastImagesCountRef.current)) {
      let label = "";
      if (shotsChanged && shots.length > 0) label = `生成 ${shots.length} 个镜头`;
      else if (imageChanged) label = `已出图 ${imageCount}/${shots.length}`;
      if (label) {
        pushSnapshot(pid, {
          label, shotsCount: shots.length, imagesCount: imageCount,
          shots: JSON.parse(JSON.stringify(shots)),
          story: panel.story, auto: true,
        });
        setHistoryKey(k => k + 1);
      }
    }
    lastShotsCountRef.current = shots.length;
    lastImagesCountRef.current = imageCount;
  }, [shots, pid, panel.story]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") { e.preventDefault(); persist(); toast.show("已手动保存", "success"); }
      if ((e.ctrlKey || e.metaKey) && e.key === "g") { e.preventDefault(); handleGenerate(); }
      if ((e.ctrlKey || e.metaKey) && e.key === "b") { e.preventDefault(); setShowPanel(p => !p); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line
  }, [panel, persist]);

  const handleGenerate = async () => {
    if (!panel.story.trim()) return toast.show("请先输入剧情", "error");
    if (loading) return;

    if (shots.length > 0) {
      pushSnapshot(pid, {
        label: "重新生成前", shotsCount: shots.length,
        imagesCount: shots.filter(s => s.image_url).length,
        shots: JSON.parse(JSON.stringify(shots)),
        story: panel.story, auto: false,
      });
    }

    setLoading(true);
    setShots([]);
    const tid = toast.show("AI 正在拆分镜头…", "loading", 0);

    const chars = listCharacters(pid);
    const charPrompt = buildCharacterPrompt(chars);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          story: panel.story, style: panel.style, duration: panel.duration,
          shotsCount: panel.shotsCount, characterContext: charPrompt,
        }),
      });
      const data = await res.json();
      toast.dismiss(tid);
      if (data.error) {
        toast.show("生成失败:" + data.error, "error", 4000);
      } else {
        setShots(data.shots);
        toast.show(`✓ 已生成 ${data.shots.length} 个镜头${chars.length > 0 ? ` · 含 ${chars.length} 个角色` : ""}`, "success");
        if (name === "未命名项目") {
          const firstSentence = panel.story.split(/[。.!?\n]/)[0].slice(0, 20);
          if (firstSentence) setName(firstSentence);
        }
      }
    } catch (e: any) {
      toast.dismiss(tid);
      toast.show("网络错误:" + e.message, "error", 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = (s: Snapshot) => {
    setShots(JSON.parse(JSON.stringify(s.shots)));
    setPanel(prev => ({ ...prev, story: s.story }));
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-5rem)]">
      <div className="lg:hidden flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-black/30 backdrop-blur">
        <button onClick={() => setShowPanel(p => !p)} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs">
          {showPanel ? "✕ 收起" : "☰ 工作台"}
        </button>
        <input value={name} onChange={(e) => setName(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm font-semibold text-white" />
      </div>

      {showPanel && (
        <ControlPanel
          state={panel} setState={setPanelPart}
          onGenerate={handleGenerate} loading={loading} hasShots={shots.length > 0}
          projectId={pid} shots={shots}
          onShotsChange={setShots}
          onPreviewShot={(idx) => setLightboxIdx(idx)}
          onRestoreSnapshot={handleRestore}
          historyRefreshKey={historyKey}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <div className="hidden lg:flex items-center justify-between gap-3 px-6 py-3 border-b border-white/5 bg-black/20 backdrop-blur sticky top-20 z-30">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link href="/projects" className="text-white/40 hover:text-white text-sm transition flex items-center gap-1">
              ← <span>项目</span>
            </Link>
            <span className="text-white/20">/</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="未命名项目"
              className="bg-transparent outline-none text-base font-semibold text-white placeholder:text-white/30 focus:bg-white/[0.03] rounded px-2 py-1 transition flex-1 min-w-0 max-w-md" />
            {saveStatus === "saving" && <span className="text-[11px] text-white/40 animate-pulse">保存中…</span>}
            {saveStatus === "saved" && <span className="text-[11px] text-emerald-300 fade-up">✓ 已保存</span>}
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden xl:flex items-center gap-3 text-[11px] text-white/40 mr-2">
              <span>📋 {shots.length} cuts</span>
              <span>·</span>
              <span>🎨 {panel.style.split(" /")[0]}</span>
              <span>·</span>
              <span>⏱ {panel.duration}s</span>
            </div>
            <button onClick={() => setShowPanel(p => !p)}
              className="px-2.5 py-1.5 rounded-lg hover:bg-white/10 text-white/60 hover:text-white text-xs transition flex items-center gap-1.5"
              title="切换工作台 (⌘B)"
            >
              {showPanel ? "◀" : "▶"}
              <span className="hidden md:inline">{showPanel ? "收起" : "展开"}</span>
            </button>
          </div>
        </div>

        <CanvasStage
          shots={shots} onShotsChange={setShots}
          presetTags={panel.presetTags} loading={loading}
          onPreviewShot={(idx) => setLightboxIdx(idx)}
        />
      </div>

      {lightboxIdx !== null && shots[lightboxIdx]?.image_url && (
        <Lightbox shots={shots} currentIdx={lightboxIdx}
          onClose={() => setLightboxIdx(null)} onNav={setLightboxIdx} />
      )}
    </div>
  );
}
