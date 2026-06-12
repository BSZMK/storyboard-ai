export interface Character {
  id: string;
  name: string;
  role: string;        // 主角/配角/反派/客串
  appearance: string;  // 外观中文描述
  personality: string; // 性格
  prompt: string;      // 英文 AI prompt
}

const KEY = (projectId: string) => `chars_${projectId}`;

export function newCharacterId() {
  return "ch_" + Math.random().toString(36).slice(2, 9);
}

export function listCharacters(projectId: string): Character[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY(projectId)) || "[]");
  } catch {
    return [];
  }
}

export function saveCharacter(projectId: string, c: Character) {
  const list = listCharacters(projectId);
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.push(c);
  localStorage.setItem(KEY(projectId), JSON.stringify(list));
}

export function deleteCharacter(projectId: string, id: string) {
  const list = listCharacters(projectId).filter((x) => x.id !== id);
  localStorage.setItem(KEY(projectId), JSON.stringify(list));
}

export function buildCharacterPrompt(chars: Character[]): string {
  if (chars.length === 0) return "";
  return chars
    .map((c) => `[${c.name}: ${c.prompt}]`)
    .join(", ");
}
