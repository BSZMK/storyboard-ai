"use client";
import { Project } from "../lib/projectStore";
import { TAG_LIBRARY } from "../lib/tagLibrary";

interface Props {
  projects: Project[];
}

export default function Dashboard({ projects }: Props) {
  if (projects.length === 0) return null;

  // 统计数据
  const totalShots = projects.reduce((a, p) => a + p.shots.length, 0);
  const totalDuration = projects.reduce(
    (a, p) => a + p.shots.reduce((s, sh) => s + (sh.duration_sec || 0) + (sh.duration_frames || 0) / 24, 0),
    0
  );
  const totalImages = projects.reduce(
    (a, p) => a + p.shots.filter(s => s.image_url).length,
    0
  );
  const avgShots = projects.length > 0 ? (totalShots / projects.length).toFixed(1) : 0;

  // 风格分布
  const styleCount: Record<string, number> = {};
  projects.forEach(p => {
    const s = p.style || "未分类";
    styleCount[s] = (styleCount[s] || 0) + 1;
  });
  const topStyles = Object.entries(styleCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // 镜头类型分布
  const shotTypeCount: Record<string, number> = {};
  projects.forEach(p => {
    p.shots.forEach(s => {
      const t = s.shot_type || "OTHER";
      shotTypeCount[t] = (shotTypeCount[t] || 0) + 1;
    });
  });
  const topShotTypes = Object.entries(shotTypeCount).sort((a, b) => b[1] - a[1]).slice(0, 6);

  // 最常用预设
  const tagCount: Record<string, number> = {};
  projects.forEach(p => {
    (p.presetTags || []).forEach(t => {
      tagCount[t] = (tagCount[t] || 0) + 1;
    });
  });
  const allTags = TAG_LIBRARY.flatMap(c => c.tags);
  const topTags = Object.entries(tagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, c]) => ({ tag: allTags.find(t => t.id === id), count: c }))
    .filter(x => x.tag);

  // 最近活跃天数
  const now = Date.now();
  const week = projects.filter(p => now - p.updatedAt < 7 * 86400000).length;

  // 总时长格式化
  const fmtTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.round(sec % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const maxStyleCount = Math.max(...topStyles.map(([, v]) => v), 1);
  const maxShotCount = Math.max(...topShotTypes.map(([, v]) => v), 1);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
      {/* 主指标 */}
      <StatCard icon="📁" label="项目总数" en="Projects" value={projects.length} highlight />
      <StatCard icon="🎬" label="镜头总数" en="Total Cuts" value={totalShots} sub={`平均 ${avgShots} 个/项目`} />
      <StatCard icon="⏱" label="累计时长" en="Total Duration" value={fmtTime(totalDuration)} />
      <StatCard icon="🖼" label="已生成图" en="Generated" value={totalImages} sub={`${week} 个本周活跃`} />

      {/* 详细图表 */}
      {topStyles.length > 0 && (
        <div className="col-span-2 md:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-white">🎨 风格分布</div>
              <div className="text-[10px] text-white/40 font-mono">Style Distribution</div>
            </div>
          </div>
          <div className="space-y-2">
            {topStyles.map(([style, count]) => (
              <div key={style}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-white/70 truncate">{style}</span>
                  <span className="text-cyan-300 font-mono">{count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                    style={{ width: `${(count / maxStyleCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topShotTypes.length > 0 && (
        <div className="col-span-2 md:col-span-2 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-white">📹 镜头类型</div>
              <div className="text-[10px] text-white/40 font-mono">Shot Type Mix</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {topShotTypes.map(([type, count]) => (
              <div key={type} className="bg-white/[0.03] rounded-lg p-2 border border-white/5">
                <div className="text-[10px] text-white/40 font-mono">{type}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-amber-300">{count}</span>
                  <span className="text-[9px] text-white/40">
                    {((count / totalShots) * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="mt-1 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full bg-amber-300/70"
                    style={{ width: `${(count / maxShotCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {topTags.length > 0 && (
        <div className="col-span-2 md:col-span-4 glass rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-medium text-white">🎬 高频预设</div>
              <div className="text-[10px] text-white/40 font-mono">Top Used Presets</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {topTags.map(({ tag, count }, i) => (
              <span key={tag!.id} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-400/10 border border-cyan-400/30 text-xs text-cyan-100">
                <span className="text-[10px] text-white/40 font-mono">#{i + 1}</span>
                <span>{tag!.cn}</span>
                <span className="text-[10px] text-white/50 font-mono">{tag!.en}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-cyan-400/30 text-[10px] text-white">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, en, value, sub, highlight }: {
  icon: string; label: string; en: string; value: string | number; sub?: string; highlight?: boolean;
}) {
  return (
    <div className={`glass rounded-2xl p-5 ${highlight ? "bg-gradient-to-br from-blue-500/10 to-cyan-400/10 border-cyan-400/30" : ""}`}>
      <div className="flex items-start justify-between">
        <div className="text-2xl">{icon}</div>
      </div>
      <div className="mt-3 text-3xl font-bold text-gradient">{value}</div>
      <div className="text-sm text-white/70 mt-1">{label}</div>
      <div className="text-[10px] text-white/40 font-mono">{en}</div>
      {sub && <div className="text-[11px] text-white/45 mt-2">{sub}</div>}
    </div>
  );
}
