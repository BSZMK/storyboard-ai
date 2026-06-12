"use client";
import { Snapshot } from "../lib/historyStore";

interface Props {
  projectId: string;
  onRestore: (s: Snapshot) => void;
  refreshKey: number;
}

export default function HistoryTab({ projectId, onRestore }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-white">历史回溯</div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
        当前项目 {projectId ? `(${projectId})` : "(未指定)"} 的历史快照存储在本地浏览器。
      </div>
      <button
        onClick={() => onRestore({ id: "", projectId, label: "示例快照", timestamp: Date.now(), shotsCount: 0, imagesCount: 0, shots: [], story: "", auto: false })}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold text-sm hover:opacity-90 transition"
      >
        恢复最近快照
      </button>
    </div>
  );
}
