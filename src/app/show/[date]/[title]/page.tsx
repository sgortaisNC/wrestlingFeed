import { notFound } from 'next/navigation';
import {
  buildCalendarShows,
  findCalendarShow,
  getAppCalendarDate,
  getPleEventsForCalendar,
  getWrestlersForCalendar,
} from '@/lib/showCalendar';
import { ShowPageClient } from './ShowPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

type PageProps = { params: Promise<{ date: string; title: string }> };

export default async function ShowPage({ params }: PageProps) {
  const { date: dateKey, title: titleParam } = await params;
  const decodedTitle = decodeURIComponent(titleParam);

  const [fetchDate, allWrestlers, pleEvents] = await Promise.all([
    getAppCalendarDate(),
    getWrestlersForCalendar(),
    getPleEventsForCalendar(),
  ]);
  const shows = buildCalendarShows(fetchDate, allWrestlers, pleEvents);
  const show = findCalendarShow(shows, dateKey, decodedTitle);

  if (!show) {
    notFound();
  }

  return <ShowPageClient show={show} />;
}
