import { prisma } from '@/utils/prisma';

export type CalendarWrestler = Awaited<ReturnType<typeof getWrestlersForCalendar>>[number];

export async function getAppCalendarDate(): Promise<string> {
  const row = await prisma.options.findUnique({
    where: { key: 'date' },
  });
  return row!.value;
}

export async function getWrestlersForCalendar() {
  return prisma.wrestler.findMany({
    orderBy: [{ name: 'asc' }],
    include: { match: true },
  });
}

const PLE_DATES = [
  { date: '2026-4-18', event: 'WrestleMania 42 (Night 1)' },
  { date: '2026-4-19', event: 'WrestleMania 42 (Night 2)' },
  { date: '2026-5-31', event: 'Clash in Italy' },
  { date: '2026-8-01', event: 'SummerSlam (Night 1)' },
  { date: '2026-8-02', event: 'SummerSlam (Night 2)' },
  { date: '2026-9-06', event: 'Money in the Bank' },
] as const;

export type CalendarShow = {
  date: string;
  title: string;
  wrestlers: CalendarWrestler[];
};

/** Clé URL locale YYYY-MM-DD (alignée sur la boucle du calendrier home). */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildCalendarShows(fetchDate: string, allWrestlers: CalendarWrestler[]): CalendarShow[] {
  const date = new Date(fetchDate);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  const shows: CalendarShow[] = [];

  while (date.getTime() < yesterday.getTime()) {
    date.setDate(date.getDate() + 1);

    const timeWrestler = allWrestlers.filter((w) => {
      return w.match.length === 0 || w.match.at(-1)?.date.toISOString() !== date.toISOString();
    });

    const checkPLE = PLE_DATES.filter(
      (p) => p.date === `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    );
    if (checkPLE.length > 0) {
      shows.push({
        date: date.toISOString(),
        title: 'PLE',
        wrestlers: timeWrestler,
      });
    }

    if (date.getDay() === 5) {
      shows.push({ date: date.toISOString(), title: 'SmackDown', wrestlers: timeWrestler });
    } else if (date.getDay() === 2) {
      shows.push({ date: date.toISOString(), title: 'NXT', wrestlers: timeWrestler });
    } else if (date.getDay() === 3) {
      shows.push({ date: date.toISOString(), title: 'Evolve', wrestlers: timeWrestler });
    } else if (date.getDay() === 1) {
      shows.push({ date: date.toISOString(), title: 'Raw', wrestlers: timeWrestler });
    }
  }

  return shows;
}

export function findCalendarShow(
  shows: CalendarShow[],
  dateKey: string,
  decodedTitle: string
): CalendarShow | undefined {
  return shows.find(
    (s) => formatLocalDateKey(new Date(s.date)) === dateKey && s.title === decodedTitle
  );
}
