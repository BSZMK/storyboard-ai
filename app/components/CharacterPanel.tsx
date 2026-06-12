"use client";
import { useState, useEffect } from "react";
import {
  Character,
  listCharacters,
  saveCharacter,
  deleteCharacter,
  newCharacterId,
} from "../lib/characterStore";
import { useToast } from "./Toast";

/* ============ 预设角色库 ============ */
const CHARACTER_PRESETS: Omit<Character, "id">[] = [
  {
    name: "戴眼镜青年",
    role: "主角",
    appearance: "20 岁出头,黑色短发,圆框眼镜,白色衬衫,牛仔裤,瘦高身形",
    personality: "内向,敏感,容易犹豫",
    prompt: "young asian man, early 20s, short black hair, round glasses, white shirt, jeans, slim build, gentle expression",
  },
  {
    name: "干练女性",
    role: "配角",
    appearance: "30 岁,黑色长直发,深色西装,干练眼神",
    personality: "果断,自信,职场精英",
    prompt: "asian woman, 30s, long straight black hair, dark business suit, sharp confident eyes, professional",
  },
  {
    name: "可爱少女",
    role: "主角",
    appearance: "16 岁,棕色双马尾,水手服校服,大眼睛",
    personality: "活泼,开朗,好奇心强",
    prompt: "cute japanese schoolgirl, 16 years old, brown twin tails, sailor uniform, big bright eyes, cheerful",
  },
  {
    name: "沧桑老人",
    role: "配角",
    appearance: "70 岁,白发,皱纹,深色外套,温和笑容",
    personality: "睿智,慈祥,经历丰富",
    prompt: "elderly asian man, 70s, white hair, weathered face with wrinkles, dark coat, kind warm smile, wise",
  },
  {
    name: "神秘男子",
    role: "反派",
    appearance: "黑色风衣,鸭舌帽压低,看不清脸",
    personality: "冷峻,深不可测",
    prompt: "mysterious man in long black trench coat, low cap covering face, shadowy figure, cinematic noir",
  },
  {
    name: "运动少年",
    role: "主角",
    appearance: "17 岁,短发,运动服,健康肤色,阳光笑容",
    personality: "热血,正直,坚韧",
    prompt: "athletic teenage boy, 17 years old, short hair, sportswear, tanned skin, bright sunny smile, energetic",
  },
];

/* ============ 组件 ============ */
interface Props {
  projectId: string;
}

export default function CharacterPanel({ projectId }: Props) {
  const toast = useToast();
  const [chars, setChars] = useState<Character[]>([]);
  const [editing, setEditing] = useState<Character | null>(null);

  useEffect(() => {
    setChars(listCharacters(projectId));
  }, [projectId]);

  const refresh = () => setChars(listCharacters(projectId));

  const addChar = (preset?: Omit<Character, "id">) => {
    const base: Character = preset
      ? { id: newCharacterId(), ...preset }
      : {
          id: newCharacterId(),
          name: "新角色",
          role: "配角",
          appearance: "",
          personality: "",
          prompt: "",
        };
    setEditing(base);
  };

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast.show("请填写角色名", "error");
      return;
    }
    saveCharacter(projectId, editing);
    refresh();
    setEditing(null);
    toast.show("✓ 已保存角色", "success");
  };

  const remove = (id: string) => {
    if (!confirm("删除该角色?")) return;
    deleteCharacter(projectId, id);
    refresh();
    toast.show("已删除", "info");
  };

  return (
    <div className="space-y-4">
      {/* 已添加角色 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-white/80">
            👥 已添加角色 <span className="text-white/40">({chars.length})</span>
          </h3>
          <button
            onClick={() => addChar()}
            className="text-[10px] px-2 py-1 rounded-md bg-cyan-400/15 hover:bg-cyan-400/25 text-cyan-200 transition"
          >
            + 新建
          </button>
        </div>

        {chars.length === 0 ? (
          <div className="text-center py-6 text-xs text-white/30 border border-dashed border-white/10 rounded-lg">
            还没有角色,从下方预设挑一个吧
          </div>
        ) : (
          <div className="space-y-2">
            {chars.map((c) => (
              <div
                key={c.id}
                className="glass rounded-lg p-3 group hover:ring-1 hover:ring-cyan-400/30 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{c.name}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                        {c.role}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/60 line-clamp-2">{c.appearance}</div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => setEditing(c)}
                      className="w-6 h-6 rounded text-white/50 hover:text-white hover:bg-white/10 text-xs"
                      title="编辑"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="w-6 h-6 rounded text-white/40 hover:text-red-300 hover:bg-red-400/15 text-xs"
                      title="删除"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 预设库 */}
      <div>
        <h3 className="text-xs font-semibold text-white/80 mb-2">🎭 角色预设库</h3>
        <div className="space-y-2">
          {CHARACTER_PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => addChar(p)}
              className="w-full text-left glass rounded-lg p-2.5 hover:ring-1 hover:ring-cyan-400/30 hover:bg-white/[0.04] transition"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-white">{p.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-white/60">
                  {p.role}
                </span>
                <span className="ml-auto text-[10px] text-cyan-300 opacity-0 group-hover:opacity-100">
                  + 添加
                </span>
              </div>
              <div className="text-[10px] text-white/50 line-clamp-1">{p.appearance}</div>
            </button>
          ))}
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editing && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setEditing(null)}
        >
          <div
            className="glass rounded-2xl p-5 w-full max-w-md space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">编辑角色</h3>
              <button
                onClick={() => setEditing(null)}
                className="text-white/40 hover:text-white text-lg"
              >
                ✕
              </button>
            </div>

            <Field label="角色名">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                className="field-input"
                placeholder="例如:小明"
              />
            </Field>

            <Field label="角色定位">
              <select
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                className="field-input"
              >
                <option value="主角">主角</option>
                <option value="配角">配角</option>
                <option value="反派">反派</option>
                <option value="客串">客串</option>
              </select>
            </Field>

            <Field label="外观描述">
              <textarea
                value={editing.appearance}
                onChange={(e) => setEditing({ ...editing, appearance: e.target.value })}
                rows={2}
                className="field-input resize-none"
                placeholder="年龄、发型、穿着、体型…"
              />
            </Field>

            <Field label="性格">
              <input
                value={editing.personality}
                onChange={(e) => setEditing({ ...editing, personality: e.target.value })}
                className="field-input"
                placeholder="内向 / 开朗 / 神秘…"
              />
            </Field>

            <Field label="AI Prompt(英文,出图用)">
              <textarea
                value={editing.prompt}
                onChange={(e) => setEditing({ ...editing, prompt: e.target.value })}
                rows={3}
                className="field-input resize-none font-mono text-[11px]"
                placeholder="young asian man, glasses, ..."
              />
            </Field>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs"
              >
                取消
              </button>
              <button
                onClick={save}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 text-white text-xs font-semibold hover:shadow-lg hover:shadow-cyan-500/30"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.field-input) {
          width: 100%;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 8px 10px;
          color: white;
          font-size: 12px;
          outline: none;
          transition: border-color 0.2s;
        }
        :global(.field-input:focus) {
          border-color: rgba(34, 211, 238, 0.4);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] text-white/50 mb-1 font-medium">{label}</label>
      {children}
    </div>
  );
}
