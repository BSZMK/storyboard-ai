"use client";
import { Shot } from "../StoryboardTable";

interface Props {
  shots: Shot[];
  presetTags: string[];
  duration: number;
  shotsCount: number;
}

export default function StatsTab({ shots, presetTags, duration, shotsCount }: Props) {
  const imageCount = shots.filter(s => s.image_url).length;
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-white">项目数据</div>
      <div className="grid grid-cols-2 gap-4">
        <Stat label="镜头数" value={shotsCount.toString()} />
        <Stat label="实际镜头" value={shots.length.toString()} />
        <Stat label="含图镜头" value={imageCount.toString()} />
        <Stat label="预设标签" value={presetTags.length.toString()} />
      </div>
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white/60">
        理想时长: {duration}s · 当前预计时长: {Math.round(shots.length * 1.5)}s
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/30 p-4 text-center">
      <div className="text-xs text-white/40">{label}</div>
      <div className="text-3xl font-semibold text-white mt-2">{value}</div>
    </div>
  );
}
