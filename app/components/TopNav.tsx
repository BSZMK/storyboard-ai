"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TopNav() {
  const path = usePathname();
  const isActive = (p: string) => path === p || (p !== "/" && path.startsWith(p));

  const links = [
    { href: "/", label: "首页", en: "Home" },
    { href: "/projects", label: "项目", en: "Projects" },
    { href: "/canvas", label: "画布", en: "Canvas" },
  ];

  return (
    <nav className="fixed top-0 inset-x-0 z-50 backdrop-blur-md bg-black/40 border-b border-white/5 print:hidden">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold group-hover:scale-105 transition">
            S
          </div>
          <span className="font-semibold tracking-tight">Storyboard AI</span>
          <span className="ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full border border-white/15 text-white/60">BETA</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-4 py-1.5 rounded-full text-sm transition flex items-center gap-1.5 ${
                isActive(l.href)
                  ? "bg-white/10 text-white border border-white/15"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <span>{l.label}</span>
              <span className="text-[10px] opacity-40 font-mono">{l.en}</span>
            </Link>
          ))}
        </div>

        <Link href="/canvas" className="btn-ghost text-sm">
          ✨ 新建分镜 →
        </Link>
      </div>
    </nav>
  );
}
