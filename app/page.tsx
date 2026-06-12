"use client";
import Link from "next/link";
import TopNav from "./components/TopNav";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <TopNav />

      {/* Hero */}
      <section className="relative pt-40 pb-24 px-6 bg-grid">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="fade-up inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-xs text-white/70 mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            通义千问 Qwen + 万相 WanX · 60+ 电影预设 · 12 个导演组合
          </div>

          <h1 className="fade-up delay-1 text-5xl md:text-7xl lg:text-[88px] font-semibold tracking-tighter leading-[1.05]">
            <span className="text-gradient">从剧本到分镜</span><br />
            <span className="text-white/95">只需一次呼吸</span>
          </h1>

          <p className="fade-up delay-2 mt-8 text-lg md:text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            工业级 AI 分镜生成平台。多项目工作台 · 电影感预设库 · 一键导出 PDF。
            <br /><span className="text-white/40 text-base">From script to shots — instantly.</span>
          </p>

          <div className="fade-up delay-3 mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link href="/canvas" className="btn-primary">⚡ 开始创作 · Start Canvas</Link>
            <Link href="/projects" className="btn-ghost">📁 我的项目 · Projects</Link>
          </div>

          <div className="fade-up delay-4 mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              { v: "<10s", k: "拆分速度", e: "Generation" },
              { v: "60+", k: "电影预设", e: "Presets" },
              { v: "12", k: "导演组合", e: "Combos" },
              { v: "∞", k: "项目数量", e: "Projects" },
            ].map(s => (
              <div key={s.k} className="glass rounded-2xl p-5">
                <div className="text-3xl font-bold text-gradient">{s.v}</div>
                <div className="text-sm text-white/70 mt-1">{s.k}</div>
                <div className="text-[11px] text-white/40">{s.e}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 特性 */}
      <section className="relative py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="text-xs font-mono tracking-widest text-cyan-300/80 mb-3">— FEATURES —</div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">
              为创作者打造的<span className="text-gradient">智能工作台</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { icon: "📁", t: "多项目管理", e: "Multi-Projects", d: "类 liblib.tv 工作台,所有作品本地保存,随时打开继续编辑。" },
              { icon: "🎬", t: "电影感预设库", e: "Cinematic Library", d: "运镜 / 镜头语言 / 镜头 / 相机 / 转场,5 大类 60+ 标签自由组合。" },
              { icon: "⚡", t: "导演级模板", e: "Director Combos", d: "诺兰、王家卫、赛博朋克…一键加载工业级组合方案。" },
            ].map(f => (
              <div key={f.t} className="glass rounded-2xl p-7 hover:border-white/20 transition group">
                <div className="text-4xl mb-4 group-hover:scale-110 transition">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-1">{f.t}</h3>
                <div className="text-xs text-white/40 mb-3">{f.e}</div>
                <p className="text-sm text-white/60 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto glass rounded-3xl p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold mb-4">
            准备好了吗?<span className="text-gradient">开始你的第一个分镜</span>
          </h2>
          <p className="text-white/50 mb-8">无需注册 · 数据本地存储 · 完全免费</p>
          <Link href="/canvas" className="btn-primary inline-block">🚀 立即进入画布</Link>
        </div>
      </section>

      <footer className="relative border-t border-white/5 py-12 px-6 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400" />
            Storyboard AI · 智能分镜生成平台
          </div>
          <div>© {new Date().getFullYear()} · Made with ⚡</div>
        </div>
      </footer>
    </main>
  );
}
