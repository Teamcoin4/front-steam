export interface Friend {
  steamid: string;
  persona_name: string;
  avatar: string;
  relationship: string;
  privacy_state: string;
  personastate?: number;
  stats?: {
    mutual_owned: number;
    recent_overlap: number;
    last_online_at: string;
  };
}

export interface FriendsResponse {
  summary: {
    total: number;
    stale: boolean;
  };
  items: Friend[];
  paging: {
    page: number;
    size: number;
    total: number;
  };
}