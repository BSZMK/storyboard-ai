"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import TopNav from "../components/TopNav";
import Dashboard from "../components/Dashboard";
import { listProjects, deleteProject, duplicateProject, Project } from "../lib/projectStore";
import { exportProject, exportAllProjects, importProjectFromFile } from "../lib/projectIO";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"updated" | "created" | "name">("updated");
  const [showDashboard, setShowDashboard] = useState(true);
  const [importMsg, setImportMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => setProjects(listProjects());
  useEffect(() => { refresh(); }, []);

  const filtered = projects
    .filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.story.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "created") return b.createdAt - a.createdAt;
      return b.updatedAt - a.updatedAt;
    });

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`确定删除项目「${name}」?此操作无法撤销。`)) return;
    deleteProject(id);
    refresh();
  };

  const handleDuplicate = (id: string) => {
    duplicateProject(id);
    refresh();
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const result = await importProjectFromFile(file);
    setImportMsg(result.msg);
    setTimeout(() => setImportMsg(""), 3500);
    if (result.ok) refresh();
    e.target.value = "";
  };

  const formatDate = (t: number) => {
    const d = new Date(t);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <main className="relative min-h-screen">
      <TopNav />

      <section className="relative pt-28 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* 头部 */}
          <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
            <div>
              <div className="text-xs font-mono tracking-widest text-cyan-300/80 mb-2">— WORKSPACE —</div>
              <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                我的<span className="text-gradient">项目工作台</span>
              </h1>
              <p className="text-white/50 mt-3 text-sm">
                共 {projects.length} 个项目 · 全部数据本地存储
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => fileRef.current?.click()} className="btn-ghost text-sm" title="从 JSON 文件导入">
                📥 导入 · Import
              </button>
              <button onClick={exportAllProjects} className="btn-ghost text-sm" title="导出全部为 JSON">
                📤 导出全部 · Export
              </button>
              <Link href="/canvas" className="btn-primary">
                ✨ 新建项目
              </Link>
            </div>
            <input ref={fileRef} type="file" accept=".json,application/json" onChange={handleImport} className="hidden" />
          </div>

          {/* 导入提示 */}
          {importMsg && (
            <div className={`mb-4 p-3 rounded-xl border text-sm fade-up ${
              importMsg.startsWith("✅")
                ? "bg-emerald-500/10 border-emerald-400/30 text-emerald-300"
                : "bg-red-500/10 border-red-400/30 text-red-300"
            }`}>
              {importMsg}
            </div>
          )}

          {/* 仪表盘 */}
          {showDashboard && projects.length > 0 && (
            <div className="fade-up">
              <div className="flex items-center justify-between mb-3">
                <div className="text-xs text-white/40 font-mono tracking-wider">📊 OVERVIEW · 数据概览</div>
                <button onClick={() => setShowDashboard(false)} className="text-[11px] text-white/40 hover:text-white">收起 ▴</button>
              </div>
              <Dashboard projects={projects} />
            </div>
          )}
          {!showDashboard && projects.length > 0 && (
            <button onClick={() => setShowDashboard(true)} className="text-xs text-white/50 hover:text-white mb-4">
              📊 展开数据概览 ▾
            </button>
          )}

          {/* 工具栏 */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <div className="flex-1 min-w-[220px] relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">🔍</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="搜索项目名称或剧情… Search"
                className="field pl-10"
              />
            </div>
            <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="field cursor-pointer max-w-[180px]">
              <option value="updated" className="bg-slate-900">最近更新</option>
              <option value="created" className="bg-slate-900">创建时间</option>
              <option value="name" className="bg-slate-900">按名称</option>
            </select>
          </div>

          {/* 项目网格 */}
          {filtered.length === 0 ? (
            <div className="glass rounded-2xl p-16 text-center">
              <div className="text-6xl mb-4 opacity-50">📭</div>
              <h3 className="text-xl font-semibold mb-2">
                {projects.length === 0 ? "还没有项目" : "未找到匹配项目"}
              </h3>
              <p className="text-white/50 mb-6 text-sm">
                {projects.length === 0 ? "创建你的第一个分镜项目开始吧" : "尝试更换搜索关键词"}
              </p>
              {projects.length === 0 && (
                <div className="flex gap-3 justify-center">
                  <Link href="/canvas" className="btn-primary inline-block">🚀 创建项目</Link>
                  <button onClick={() => fileRef.current?.click()} className="btn-ghost">📥 导入 JSON</button>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <Link
                href="/canvas"
                className="group relative rounded-2xl border-2 border-dashed border-white/15 hover:border-cyan-400/50 hover:bg-cyan-400/[0.03] transition flex flex-col items-center justify-center min-h-[260px] p-6"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition">
                  ✨
                </div>
                <div className="font-medium text-white">新建项目</div>
                <div className="text-xs text-white/40 mt-1">Create New Project</div>
              </Link>

              {filtered.map(p => (
                <div key={p.id} className="group glass rounded-2xl overflow-hidden hover:border-cyan-400/30 transition flex flex-col">
                  <Link href={`/canvas/${p.id}`} className="block aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                    {p.cover ? (
                      <img src={p.cover} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl text-white/20">🎬</div>
                    )}
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-white/80 font-mono">
                      {p.shots.length} cuts
                    </div>
                    {p.presetTags.length > 0 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-cyan-400/30 backdrop-blur text-[10px] text-cyan-100">
                        🎬 {p.presetTags.length}
                      </div>
                    )}
                  </Link>

                  <div className="p-4 flex-1 flex flex-col">
                    <Link href={`/canvas/${p.id}`}>
                      <h3 className="font-semibold text-white truncate hover:text-cyan-300 transition">{p.name}</h3>
                    </Link>
                    <p className="text-xs text-white/45 mt-1.5 line-clamp-2 flex-1">{p.story}</p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                      <span className="text-[10px] text-white/40 font-mono">{formatDate(p.updatedAt)}</span>
                      <div className="flex gap-1">
                        <button onClick={() => exportProject(p)} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition" title="导出">📤</button>
                        <button onClick={() => handleDuplicate(p.id)} className="p-1.5 rounded hover:bg-white/10 text-white/40 hover:text-white transition" title="复制">📋</button>
                        <button onClick={() => handleDelete(p.id, p.name)} className="p-1.5 rounded hover:bg-red-400/15 text-white/40 hover:text-red-300 transition" title="删除">🗑</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
