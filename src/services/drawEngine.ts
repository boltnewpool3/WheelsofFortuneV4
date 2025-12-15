import { Contestant, ContestData, DrawResult } from '../types';

export async function loadContestData(): Promise<ContestData> {
  const response = await fetch('/contest-data.json');
  if (!response.ok) {
    throw new Error('Failed to load contest data');
  }
  return response.json();
}

export function getAvailableTickets(
  contestants: Contestant[],
  completedDrawResults: DrawResult[]
): string[] {
  const winnerIds = new Set(
    completedDrawResults
      .filter(draw => draw.status === 'completed' && draw.winner_id !== null)
      .map(draw => draw.winner_id)
  );

  const availableTickets: string[] = [];

  for (const contestant of contestants) {
    if (!winnerIds.has(contestant.id)) {
      availableTickets.push(...contestant.tickets);
    }
  }

  return availableTickets;
}

export function selectRandomTicket(availableTickets: string[]): string {
  if (availableTickets.length === 0) {
    throw new Error('No tickets available for draw');
  }
  const randomIndex = Math.floor(Math.random() * availableTickets.length);
  return availableTickets[randomIndex];
}

export function findContestantByTicket(
  contestants: Contestant[],
  ticket: string
): Contestant | undefined {
  for (const contestant of contestants) {
    if (contestant.tickets.includes(ticket)) {
      return contestant;
    }
  }
  return undefined;
}

export async function initializeDraws(supabase: any): Promise<void> {
  const contestData = await loadContestData();

  for (const drawDef of contestData.draws) {
    const { data } = await supabase
      .from('draws')
      .select('id')
      .eq('draw_number', drawDef.drawNumber)
      .maybeSingle();

    if (!data) {
      await supabase.from('draws').insert({
        draw_number: drawDef.drawNumber,
        prize: drawDef.prize,
        status: 'pending',
      });
    }
  }
}

export async function executeDrawAndGetResults(
  supabase: any,
  drawNumber: number,
  contestants: Contestant[]
): Promise<{ ticketNumber: string; contestant: Contestant }> {
  const { data: allDraws } = await supabase
    .from('draws')
    .select('*')
    .order('draw_number', { ascending: true });

  const completedDraws = (allDraws as DrawResult[]).filter(
    d => d.status === 'completed'
  );

  const availableTickets = getAvailableTickets(contestants, completedDraws);
  const selectedTicket = selectRandomTicket(availableTickets);
  const winnerContestant = findContestantByTicket(contestants, selectedTicket);

  if (!winnerContestant) {
    throw new Error('Selected ticket does not belong to any contestant');
  }

  const drawDefinition = (allDraws as DrawResult[]).find(
    d => d.draw_number === drawNumber
  );

  await supabase.from('draws').update({
    status: 'completed',
    winning_ticket: selectedTicket,
    winner_id: winnerContestant.id,
    winner_name: winnerContestant.name,
    drawn_at: new Date().toISOString(),
  }).eq('draw_number', drawNumber);

  return {
    ticketNumber: selectedTicket,
    contestant: winnerContestant,
  };
}

export async function getDrawResults(supabase: any): Promise<DrawResult[]> {
  const { data } = await supabase
    .from('draws')
    .select('*')
    .order('draw_number', { ascending: true });

  return (data as DrawResult[]) || [];
}
