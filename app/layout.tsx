import "./globals.css";
import type { Metadata } from "next";
import { ToastProvider } from "./components/Toast";

export const metadata: Metadata = {
  title: "Storyboard AI · 智能分镜生成",
  description: "工业级 AI 分镜生成平台 · 从剧本到分镜,只需一次呼吸",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body className="antialiased">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
