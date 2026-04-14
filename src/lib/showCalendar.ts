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

export type PleEventRow = { dateKey: string; label: string };

export async function getPleEventsForCalendar(): Promise<PleEventRow[]> {
  return prisma.pleEvent.findMany({
    orderBy: { dateKey: 'asc' },
    select: { dateKey: true, label: true },
  });
}

export type CalendarShow = {
  date: string;
  title: string;
  /** Libellé affiché pour les PLE (ex. WrestleMania 42). */
  pleLabel?: string;
  wrestlers: CalendarWrestler[];
};

/** Clé URL locale YYYY-MM-DD (alignée sur la boucle du calendrier home). */
export function formatLocalDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function buildCalendarShows(
  fetchDate: string,
  allWrestlers: CalendarWrestler[],
  pleEvents: PleEventRow[]
): CalendarShow[] {
  const date = new Date(fetchDate);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 2);

  const shows: CalendarShow[] = [];

  while (date.getTime() < yesterday.getTime()) {
    date.setDate(date.getDate() + 1);

    const timeWrestler = allWrestlers.filter((w) => {
      return w.match.length === 0 || w.match.at(-1)?.date.toISOString() !== date.toISOString();
    });

    const dayKey = formatLocalDateKey(date);
    const ple = pleEvents.find((p) => p.dateKey === dayKey);
    if (ple) {
      shows.push({
        date: date.toISOString(),
        title: 'PLE',
        pleLabel: ple.label,
        wrestlers: timeWrestler,
      });
    }

    if (date.getDay() === 5) {
      shows.push({ date: date.toISOString(), title: 'SmackDown', wrestlers: timeWrestler });
    } else if (date.getDay() === 2) {
      shows.push({ date: date.toISOString(), title: 'NXT', wrestlers: timeWrestler });
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
