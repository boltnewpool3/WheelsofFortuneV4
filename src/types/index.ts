export interface Contestant {
  id: number;
  name: string;
  department: string;
  supervisor: string;
  tickets: number[];
}

export interface ContestData {
  contestName: string;
  contestants: Contestant[];
  draws: DrawDefinition[];
}

export interface DrawDefinition {
  drawNumber: number;
  prize: string;
}

export interface DrawResult {
  id: string;
  draw_number: number;
  prize: string;
  winning_ticket: number | null;
  winner_id: number | null;
  winner_name: string | null;
  status: 'pending' | 'completed';
  drawn_at: string | null;
  created_at: string;
}

export interface Winner {
  id: number;
  name: string;
  department: string;
  supervisor: string;
  prize: string;
  winningTicket: number;
  wonAt: string;
}
