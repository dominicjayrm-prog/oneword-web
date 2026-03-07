export interface DailyWord {
  id: string;
  word: string;
  date: string;
  category: string;
  language: string;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  current_streak: number;
  longest_streak: number;
  total_plays: number;
  total_votes_received: number;
  best_rank: number | null;
  last_played_date: string | null;
  language: string;
  push_token: string | null;
  notifications_enabled: boolean;
  notification_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface Description {
  id: string;
  user_id: string;
  word_id: string;
  description: string;
  vote_count: number;
  elo_rating: number;
  rank: number | null;
  language: string;
  created_at: string;
}

export interface Vote {
  id: string;
  voter_id: string;
  word_id: string;
  winner_id: string;
  loser_id: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  description: string;
  elo_rating: number;
  vote_count: number;
  rank: number;
  user_id: string;
  username: string;
  avatar_url: string | null;
}

export interface VotePair {
  option_a: {
    id: string;
    description: string;
    user_id: string;
  };
  option_b: {
    id: string;
    description: string;
    user_id: string;
  };
}

export interface Friendship {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: string;
  created_at: string;
  updated_at: string;
}
