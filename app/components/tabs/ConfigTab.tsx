"use client";
import { PanelState } from "../ControlPanel";

interface Props {
  state: PanelState;
  setState: (s: Partial<PanelState>) => void;
}

export default function ConfigTab({ state, setState }: Props) {
  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-white">分镜参数</div>
      <div className="space-y-4">
        <Field label="剧情描述" value={state.story} onChange={(v) => setState({ story: v })} textarea />
        <div className="grid grid-cols-2 gap-3">
          <Field label="风格" value={state.style} onChange={(v) => setState({ style: v })} />
          <Field label="镜头数" value={state.shotsCount.toString()} onChange={(v) => setState({ shotsCount: Number(v) || 1 })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="时长" value={state.duration.toString()} onChange={(v) => setState({ duration: Number(v) || 1 })} />
          <Field label="画幅" value={state.aspectRatio} onChange={(v) => setState({ aspectRatio: v as any })} />
        </div>
        <Field label="画质" value={state.quality} onChange={(v) => setState({ quality: v as any })} />
      </div>
    </div>
  );
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div>
      <div className="text-[11px] text-white/40 mb-2">{label}</div>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:bg-white/10"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400/40 focus:bg-white/10"
        />
      )}
    </div>
  );
}
