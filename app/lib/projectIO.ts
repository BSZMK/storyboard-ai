import { Project, listProjects, saveProject, newProjectId } from "./projectStore";

export function exportProject(p: Project) {
  const data = {
    type: "storyboard-project",
    version: 1,
    exportedAt: new Date().toISOString(),
    project: p,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${p.name.replace(/[^\w\u4e00-\u9fa5-]/g, "_")}-${p.id}.json`;
  a.click();
}

export function exportAllProjects() {
  const list = listProjects();
  if (list.length === 0) return alert("还没有项目可导出");
  const data = {
    type: "storyboard-projects-archive",
    version: 1,
    exportedAt: new Date().toISOString(),
    count: list.length,
    projects: list,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `storyboard-archive-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
}

export async function importProjectFromFile(file: File): Promise<{ ok: boolean; msg: string; count: number }> {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    let projectsToImport: Project[] = [];

    if (data.type === "storyboard-project" && data.project) {
      projectsToImport = [data.project];
    } else if (data.type === "storyboard-projects-archive" && Array.isArray(data.projects)) {
      projectsToImport = data.projects;
    } else if (Array.isArray(data)) {
      projectsToImport = data;
    } else if (data.id && data.shots) {
      projectsToImport = [data];
    } else {
      return { ok: false, msg: "❌ 无法识别的文件格式", count: 0 };
    }

    const existing = listProjects();
    const existingIds = new Set(existing.map(p => p.id));

    let imported = 0;
    for (const p of projectsToImport) {
      if (!p.shots) continue;
      let id = p.id;
      let name = p.name;
      // 重复 ID 时生成新 ID 并加后缀
      if (existingIds.has(id)) {
        id = newProjectId();
        name = (name || "导入项目") + " (导入)";
      }
      saveProject({
        ...p,
        id,
        name,
        createdAt: p.createdAt || Date.now(),
        updatedAt: Date.now(),
      });
      imported++;
    }
    return { ok: true, msg: `✅ 成功导入 ${imported} 个项目`, count: imported };
  } catch (e: any) {
    return { ok: false, msg: "❌ 导入失败:" + e.message, count: 0 };
  }
}
