"use client";
import { Shot } from "../StoryboardTable";

interface Props {
  shots: Shot[];
  onApply: (shots: Shot[]) => void;
}

export default function AITab({ shots, onApply }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-white">AI 助手</div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white/70">
        <div className="text-[11px] text-white/40 mb-3">使用自然语言快速修改分镜内容或重写镜头信息。</div>
        <textarea
          className="w-full min-h-[180px] rounded-3xl border border-white/10 bg-black/40 p-4 text-sm text-white outline-none focus:border-cyan-400/40"
          placeholder="例如：把这个故事改成黄昏雨夜风格，多加一些镜头运动和角色表情描述。"
        />
      </div>
      <button
        onClick={() => onApply(shots)}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold text-sm hover:opacity-90 transition"
      >
        应用 AI 修改
      </button>
    </div>
  );
}
