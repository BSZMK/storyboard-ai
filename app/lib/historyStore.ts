import { Shot } from "../components/StoryboardTable";

export interface Snapshot {
  id: string;
  projectId: string;
  label: string;
  timestamp: number;
  shotsCount: number;
  imagesCount: number;
  shots: Shot[];
  story: string;
  auto: boolean;
}

const KEY_PREFIX = "storyboard_history_";
const MAX_PER_PROJECT = 30;

export function listSnapshots(projectId: string): Snapshot[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY_PREFIX + projectId) || "[]"); }
  catch { return []; }
}

export function pushSnapshot(projectId: string, snap: Omit<Snapshot, "id" | "projectId" | "timestamp">) {
  const list = listSnapshots(projectId);
  const last = list[0];
  // 同状态去重(20 秒内不重复保存)
  if (last && Date.now() - last.timestamp < 20000 && last.shotsCount === snap.shotsCount && last.imagesCount === snap.imagesCount) {
    return;
  }
  const entry: Snapshot = {
    ...snap,
    id: "h_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    projectId,
    timestamp: Date.now(),
  };
  list.unshift(entry);
  if (list.length > MAX_PER_PROJECT) list.length = MAX_PER_PROJECT;
  localStorage.setItem(KEY_PREFIX + projectId, JSON.stringify(list));
}

export function deleteSnapshot(projectId: string, id: string) {
  const list = listSnapshots(projectId).filter(x => x.id !== id);
  localStorage.setItem(KEY_PREFIX + projectId, JSON.stringify(list));
}

export function clearSnapshots(projectId: string) {
  localStorage.removeItem(KEY_PREFIX + projectId);
}
