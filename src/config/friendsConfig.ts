export interface FriendConfigItem {
  name: string;
  url: string;
  description: string;
  avatar: string;
  type: string;
  screenshot?: string;
  recommended?: boolean;
  sort: number;
  // 友链检测：false = 显示绿色"在线"静态胶囊（见 link.astro）
  speedtest?: boolean;
}

export const friendsConfig: FriendConfigItem[] = [];
