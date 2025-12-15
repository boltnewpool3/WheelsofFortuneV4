import { Contestant, ContestData, DrawResult } from '../types';

const DRAW_RESULTS_STORAGE_KEY = 'wheels_draw_results';

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

export function getLocalDrawResults(): DrawResult[] {
  const stored = localStorage.getItem(DRAW_RESULTS_STORAGE_KEY);
  if (!stored) {
    return [];
  }
  try {
    return JSON.parse(stored) as DrawResult[];
  } catch {
    return [];
  }
}

export function saveDrawResults(results: DrawResult[]): void {
  localStorage.setItem(DRAW_RESULTS_STORAGE_KEY, JSON.stringify(results));
}

export function executeLocalDraw(
  drawNumber: number,
  contestants: Contestant[],
  completedDrawResults: DrawResult[]
): { ticketNumber: string; contestant: Contestant } {
  const availableTickets = getAvailableTickets(contestants, completedDrawResults);
  const selectedTicket = selectRandomTicket(availableTickets);
  const winnerContestant = findContestantByTicket(contestants, selectedTicket);

  if (!winnerContestant) {
    throw new Error('Selected ticket does not belong to any contestant');
  }

  return {
    ticketNumber: selectedTicket,
    contestant: winnerContestant,
  };
}
