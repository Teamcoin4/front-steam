// src/types/achievementCompare.types.ts
export interface CommonGame {
  app_id: number;
  name: string;
  // 썸네일 등 확장 시: header_image?: string;
}

export interface CompareGameInfo {
  app_id: number;
  name: string;
}

export interface AchievementSideState {
  unlocked: boolean;
}

export interface ComparedAchievementDetail {
  api_name: string;
  display_name: string;
  description?: string | null;
  you: AchievementSideState;
  friend: AchievementSideState;
}

export interface AchievementCompareSummary {
  total: number;
  youUnlocked: number;
  friendUnlocked: number;
}

export interface AchievementCompareData {
  game: CompareGameInfo;
  summary: AchievementCompareSummary;
  achievements: ComparedAchievementDetail[];
}
