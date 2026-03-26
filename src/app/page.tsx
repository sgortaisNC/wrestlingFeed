import { Show } from "@/components/Show/Show";
import {
  buildCalendarShows,
  formatLocalDateKey,
  getAppCalendarDate,
  getPleEventsForCalendar,
  getWrestlersForCalendar,
} from "@/lib/showCalendar";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const [fetchDate, allWrestlers, pleEvents] = await Promise.all([
    getAppCalendarDate(),
    getWrestlersForCalendar(),
    getPleEventsForCalendar(),
  ]);
  const shows = buildCalendarShows(fetchDate, allWrestlers, pleEvents);

  return (
    <div className="grid">
      {shows.map((show) => (
        <Show
          show={show}
          key={`${show.date}-${show.title}`}
          className={"card " + show.title}
          dateKey={formatLocalDateKey(new Date(show.date))}
        />
      ))}
    </div>
  );
}
