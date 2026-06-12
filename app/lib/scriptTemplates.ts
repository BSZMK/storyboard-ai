export interface ScriptTemplate {
  id: string;
  category: string;
  cn: string;
  en: string;
  icon: string;
  duration: number;
  style: string;
  story: string;
  recommendedTags?: string[];
  desc: string;
}

export const SCRIPT_CATEGORIES = [
  { key: "all", cn: "全部", en: "All", icon: "📚" },
  { key: "ad", cn: "广告", en: "Ad", icon: "💎" },
  { key: "vlog", cn: "Vlog", en: "Vlog", icon: "📱" },
  { key: "short", cn: "短剧", en: "Drama", icon: "🎭" },
  { key: "mv", cn: "MV", en: "MV", icon: "🎵" },
  { key: "doc", cn: "纪录", en: "Doc", icon: "🎬" },
  { key: "anime", cn: "动画", en: "Anime", icon: "🎨" },
];

export const SCRIPT_TEMPLATES: ScriptTemplate[] = [
  /* ========== 广告 ========== */
  {
    id: "ad-coffee",
    category: "ad",
    cn: "咖啡晨光广告",
    en: "Morning Coffee Ad",
    icon: "☕",
    duration: 30,
    style: "电影感 / Cinematic",
    desc: "唤醒一天的仪式感,温暖治愈",
    story: "清晨阳光透过窗帘,女主缓缓睁眼。她走到厨房,打开咖啡机,蒸汽升腾。咖啡注入杯中,她端起杯子走到阳台,望向远方城市,露出满足的微笑。画面定格在产品 Logo。",
    recommendedTags: ["push", "85mm", "alexa_mini", "dissolve", "macro_ad"],
  },
  {
    id: "ad-perfume",
    category: "ad",
    cn: "香水大片",
    en: "Perfume Commercial",
    icon: "💐",
    duration: 45,
    style: "电影感 / Cinematic",
    desc: "极致氛围感,慢镜头美学",
    story: "暮色中,女主穿着丝绸长裙走过古堡走廊。烛光摇曳,她在镜前停下,轻轻喷洒香水。镜头特写香水落在锁骨上,她转身走向夜色中的舞会。最后定格在香水瓶。",
    recommendedTags: ["dolly_in", "anamorphic", "alexa_65", "vintage", "dissolve"],
  },
  {
    id: "ad-tech",
    category: "ad",
    cn: "科技产品发布",
    en: "Tech Product Launch",
    icon: "📱",
    duration: 30,
    style: "赛博朋克 / Cyberpunk",
    desc: "未来感产品展示,赛博风",
    story: "黑暗空间中,产品悬浮旋转,蓝色光线扫过表面,展现各个细节。镜头快速推进特写产品 Logo。爆炸性光效后,产品在使用者手中,展现核心功能。最终回到产品全景,品牌名出现。",
    recommendedTags: ["dolly_zoom", "probe", "macro", "red_monstro", "smash_cut"],
  },

  /* ========== Vlog ========== */
  {
    id: "vlog-cafe",
    category: "vlog",
    cn: "咖啡店探店 Vlog",
    en: "Cafe Vlog",
    icon: "📷",
    duration: 60,
    style: "Vlog",
    desc: "轻松日常,Z 世代喜爱",
    story: "推门进入咖啡店,镜头扫过装修细节。坐到吧台前,与咖啡师聊天点单。镜头跟随咖啡的制作过程:研磨、萃取、拉花。端起咖啡走到窗边座位,翻开书,享受惬意午后。结尾对镜头说再见。",
    recommendedTags: ["pov", "handheld", "35mm_cine", "sony_fx6", "j_cut"],
  },
  {
    id: "vlog-travel",
    category: "vlog",
    cn: "旅行日记 Vlog",
    en: "Travel Vlog",
    icon: "✈️",
    duration: 90,
    style: "Vlog",
    desc: "旅途记录,真实有趣",
    story: "机场出发,行李箱滚动特写。飞机起飞,云层穿过。落地后打车去酒店,沿途风景。第二天清晨爬山看日出,壮丽全景。中午街头美食探索,本地小吃特写。傍晚海边漫步,远眺夕阳。",
    recommendedTags: ["pov", "tracking", "rise", "imax_70", "match_cut"],
  },

  /* ========== 短剧 ========== */
  {
    id: "drama-confession",
    category: "short",
    cn: "雨夜告白",
    en: "Rainy Confession",
    icon: "💔",
    duration: 60,
    style: "电影感 / Cinematic",
    desc: "经典港式文艺,情感张力",
    story: "深夜下大雨,男主撑伞站在便利店外。女主从店里出来,二人对视。男主把伞递给她,自己淋雨向远处奔跑。女主追上去,在马路中央拥抱他。镜头拉远,雨中两人成为城市光影中的剪影。",
    recommendedTags: ["handheld", "trolley", "vintage", "kodak_35", "jump_cut"],
  },
  {
    id: "drama-reveal",
    category: "short",
    cn: "悬疑反转",
    en: "Mystery Twist",
    icon: "🔍",
    duration: 45,
    style: "电影感 / Cinematic",
    desc: "悬念递进,反转结局",
    story: "侦探在昏暗房间审问嫌疑人,慢慢推近的特写。嫌疑人冷静辩解,目光闪躲。侦探突然取出证据,空气凝固。嫌疑人露出诡异微笑,镜头拉远揭示真相:他才是幕后黑手,侦探被设计了。",
    recommendedTags: ["push", "dutch", "dolly_zoom", "match_cut", "alexa_mini"],
  },
  {
    id: "drama-chase",
    category: "short",
    cn: "都市追逐",
    en: "Urban Chase",
    icon: "🏃",
    duration: 30,
    style: "电影感 / Cinematic",
    desc: "高节奏动作戏",
    story: "男主在地铁站发现追踪者,迅速跑上扶梯。穿过拥挤人群,撞翻物品。追踪者紧随其后。男主跳过栏杆,冲入车厢前一刻车门关闭,他对着站台上的追踪者露出胜利笑容。",
    recommendedTags: ["handheld", "follow", "whip", "shake", "smash_cut", "red_raptor"],
  },

  /* ========== MV ========== */
  {
    id: "mv-pop",
    category: "mv",
    cn: "流行 MV",
    en: "Pop MV",
    icon: "🎤",
    duration: 60,
    style: "电影感 / Cinematic",
    desc: "节奏剪辑,光影丰富",
    story: "歌手在霓虹灯下的街道独唱,镜头环绕。切换到屋顶舞台,鼓点响起,光柱爆发。舞蹈段落,多机位快切。情感副歌,慢镜头特写歌手脸庞,眼神深情。最后一镜从天空俯冲到歌手特写。",
    recommendedTags: ["orbit", "anamorphic", "smash_cut", "alexa_65", "white_flash"],
  },
  {
    id: "mv-ballad",
    category: "mv",
    cn: "抒情慢歌",
    en: "Ballad MV",
    icon: "🎹",
    duration: 90,
    style: "电影感 / Cinematic",
    desc: "纯净唯美,长镜头叙事",
    story: "黄昏麦田,女主身着白裙缓慢行走。微风吹起裙摆,她轻抚麦穗。镜头跟随她走向远处,夕阳逆光形成剪影。她坐在木桥上望向远方,画面慢慢叠化到星空。镜头慢慢拉远,她变成宇宙中的一个光点。",
    recommendedTags: ["follow", "85mm", "vintage", "kodak_35", "dissolve"],
  },

  /* ========== 纪录片 ========== */
  {
    id: "doc-craft",
    category: "doc",
    cn: "匠人纪录",
    en: "Craftsman Doc",
    icon: "🔨",
    duration: 90,
    style: "纪录片 / Documentary",
    desc: "手艺人故事,人文温度",
    story: "清晨,老工匠走进木工坊,推开吱呀作响的木门。镜头记录他选材、刨木、雕刻的每个细节。他停下擦汗,望向墙上的旧照片,陷入回忆。傍晚,完成的作品在夕阳下熠熠生辉,他露出满足神情。",
    recommendedTags: ["static", "macro", "85mm", "fuji_gfx", "dissolve"],
  },
  {
    id: "doc-city",
    category: "doc",
    cn: "城市变迁",
    en: "City Documentary",
    icon: "🏙",
    duration: 60,
    style: "纪录片 / Documentary",
    desc: "时代印记,大场面",
    story: "黎明前的城市俯瞰,灯光逐渐熄灭,天空泛白。延时摄影展现早高峰人潮涌动。穿插不同年代老照片对比,叠化呈现变化。傍晚归家的人们脚步匆匆。夜幕降临,城市灯火通明,无人机航拍全景。",
    recommendedTags: ["birds_eye", "rise", "18mm", "imax_70", "dissolve"],
  },

  /* ========== 动画 ========== */
  {
    id: "anime-school",
    category: "anime",
    cn: "校园日常动画",
    en: "School Anime",
    icon: "🌸",
    duration: 30,
    style: "日系动画 / Anime",
    desc: "新海诚式青春美学",
    story: "夏日午后教室,阳光透过窗户洒在课桌上。男主抬头,望向窗外的女主在樱花树下读书。微风吹起她的头发,她回头微笑。下课铃响,他鼓起勇气走过去递上一封信。她接过,两人羞涩对视。",
    recommendedTags: ["push", "85mm", "vintage", "fade_in", "dissolve"],
  },
  {
    id: "anime-action",
    category: "anime",
    cn: "热血战斗",
    en: "Action Anime",
    icon: "⚔️",
    duration: 30,
    style: "日系动画 / Anime",
    desc: "燃系动画,运镜炸裂",
    story: "废墟中,主角紧握武器对峙强敌。两人对视一秒,同时冲向对方。慢镜头中刀光剑影碰撞,火花四溅。主角被击飞撞墙,缓缓爬起,眼神坚定。蓄力后释放必杀技,巨大光束冲天而起。",
    recommendedTags: ["dolly_zoom", "low_angle", "anamorphic", "white_flash", "smash_cut"],
  },
  {
    id: "anime-magic",
    category: "anime",
    cn: "魔法奇幻",
    en: "Fantasy Anime",
    icon: "🔮",
    duration: 45,
    style: "日系动画 / Anime",
    desc: "宫崎骏式奇幻世界",
    story: "魔法森林,小女孩跟随发光的精灵深入。穿过古老石门,豁然开朗——空中漂浮着古城。她乘上巨大飞鸟,俯瞰云海中的奇景。降落在浮空岛,与神秘智者对话。最后骑着飞鸟飞向夕阳。",
    recommendedTags: ["rise", "crane_up", "18mm", "imax_70", "fade_in"],
  },
];

export function getTemplatesByCategory(cat: string): ScriptTemplate[] {
  if (cat === "all") return SCRIPT_TEMPLATES;
  return SCRIPT_TEMPLATES.filter(t => t.category === cat);
}
