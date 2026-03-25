import { notFound } from 'next/navigation';
import {
  buildCalendarShows,
  findCalendarShow,
  getAppCalendarDate,
  getWrestlersForCalendar,
} from '@/lib/showCalendar';
import { ShowPageClient } from './ShowPageClient';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

type PageProps = { params: Promise<{ date: string; title: string }> };

export default async function ShowPage({ params }: PageProps) {
  const { date: dateKey, title: titleParam } = await params;
  const decodedTitle = decodeURIComponent(titleParam);

  const fetchDate = await getAppCalendarDate();
  const allWrestlers = await getWrestlersForCalendar();
  const shows = buildCalendarShows(fetchDate, allWrestlers);
  const show = findCalendarShow(shows, dateKey, decodedTitle);

  if (!show) {
    notFound();
  }

  return <ShowPageClient show={show} />;
}
