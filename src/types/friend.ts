export interface Friend {
  steamid: string;            // ✅ 백엔드 필드명에 맞춤 (steamId → steamid)
  persona_name: string;       // ✅ 백엔드 필드명에 맞춤 (personaName → persona_name)
  avatar: string | null;
  
  state: string;              // ✅ online, in_game, away, busy, snooze, offline
  in_game: boolean;           // ✅ 게임 중 여부
  game_name?: string | null;  // ✅ 게임 이름 (in_game일 경우만 존재 가능)
  last_logoff?: string | null;// ✅ 마지막 접속 종료 시간 (ISO 문자열)

  // ✅ 이후 확장용을 대비해 Optional Stats 필드 유지
  stats?: {
    mutual_owned?: number;
    recent_overlap?: number;
    last_online_at?: string | null;
  };
}
