"use client";
import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "info" | "loading";
interface Toast { id: string; type: ToastType; msg: string; }

const ToastCtx = createContext<{ show: (msg: string, type?: ToastType, ms?: number) => string; dismiss: (id: string) => void; } | null>(null);

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((msg: string, type: ToastType = "info", ms = 2500) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, msg }]);
    if (type !== "loading" && ms > 0) {
      setTimeout(() => dismiss(id), ms);
    }
    return id;
  }, [dismiss]);

  const icons = { success: "✓", error: "✕", info: "ℹ", loading: "⏳" };
  const colors = {
    success: "border-emerald-400/40 bg-emerald-500/10 text-emerald-200",
    error: "border-red-400/40 bg-red-500/10 text-red-200",
    info: "border-cyan-400/40 bg-cyan-500/10 text-cyan-200",
    loading: "border-blue-400/40 bg-blue-500/10 text-blue-200",
  };

  return (
    <ToastCtx.Provider value={{ show, dismiss }}>
      {children}
      <div className="fixed top-20 right-4 z-[300] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            onClick={() => dismiss(t.id)}
            className={`pointer-events-auto cursor-pointer min-w-[260px] max-w-sm px-4 py-3 rounded-xl border backdrop-blur-md flex items-start gap-3 shadow-2xl fade-up ${colors[t.type]}`}
          >
            <span className={`text-lg leading-none ${t.type === "loading" ? "animate-spin" : ""}`}>{icons[t.type]}</span>
            <div className="flex-1 text-sm leading-relaxed">{t.msg}</div>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
