"use client";
import AssetPanel from "../AssetPanel";

interface Props {
  shots: import("../StoryboardTable").Shot[];
  onPreview: (idx: number) => void;
}

export default function AssetsTab({ shots, onPreview }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-white">素材库</div>
      <AssetPanel projectId="" />
      <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-white/60 text-[11px]">
        当前页面的“素材”面板和工作台“资产”共享相同库。
      </div>
    </div>
  );
}
