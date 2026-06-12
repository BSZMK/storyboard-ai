export interface Asset {
  id: string;
  name: string;
  type: "character" | "scene" | "prop" | "other";
  url: string;        // 图片 URL 或 base64
  prompt?: string;    // 生成时用的 prompt
  createdAt: number;
}

const KEY = (projectId: string) => `assets_${projectId}`;

export function newId() {
  return "as_" + Math.random().toString(36).slice(2, 9);
}

export function listAssets(projectId: string): Asset[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY(projectId)) || "[]");
  } catch {
    return [];
  }
}

export function saveAssets(projectId: string, assets: Asset[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY(projectId), JSON.stringify(assets));
}

export function addAsset(projectId: string, asset: Asset) {
  const list = listAssets(projectId);
  list.push(asset);
  saveAssets(projectId, list);
}

export function deleteAsset(projectId: string, id: string) {
  const list = listAssets(projectId).filter((x) => x.id !== id);
  saveAssets(projectId, list);
}
