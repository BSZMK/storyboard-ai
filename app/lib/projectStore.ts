import { Shot } from "../components/StoryboardTable";

export interface Project {
  id: string;
  name: string;
  story: string;
  style: string;
  duration: number;
  presetTags: string[];
  shots: Shot[];
  cover?: string;
  createdAt: number;
  updatedAt: number;
  // 新增可选字段
  aspectRatio?: "smart" | "9:16" | "1:1" | "16:9";
  quality?: "normal" | "high";
  shotsCount?: number;
}

const KEY = "storyboard_projects_v1";

export function listProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function getProject(id: string): Project | null {
  return listProjects().find(p => p.id === id) || null;
}

export function saveProject(p: Project) {
  const list = listProjects().filter(x => x.id !== p.id);
  list.unshift({ ...p, updatedAt: Date.now() });
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function deleteProject(id: string) {
  const list = listProjects().filter(x => x.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function newProjectId() {
  return "p_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function duplicateProject(id: string): Project | null {
  const p = getProject(id);
  if (!p) return null;
  const copy: Project = {
    ...p,
    id: newProjectId(),
    name: p.name + " (副本)",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  saveProject(copy);
  return copy;
}
