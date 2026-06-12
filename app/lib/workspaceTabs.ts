export interface TabDef {
  id: string;
  cn: string;
  en: string;
  icon: string;
  desc: string;
}

export const WORKSPACE_TABS: TabDef[] = [
  { id: "config",    cn: "分镜",   en: "Setup",     icon: "📋", desc: "配置生成参数" },
  { id: "ai",        cn: "AI",     en: "Assistant", icon: "🤖", desc: "自然语言改分镜" },
  { id: "characters",cn: "角色",   en: "Characters",icon: "👥", desc: "形象一致性" },
  { id: "assets",    cn: "资产",   en: "Assets",    icon: "🎨", desc: "图片素材库" },
  { id: "history",   cn: "历史",   en: "History",   icon: "📜", desc: "版本回溯" },
  { id: "stats",     cn: "数据",   en: "Stats",     icon: "📊", desc: "项目分析" },
];
