export interface FriendConfigItem {
  name: string;
  url: string;
  description: string;
  avatar: string;
  type: string;
  screenshot?: string;
  recommended?: boolean;
  sort: number;
}

export const friendsConfig: FriendConfigItem[] = [];
