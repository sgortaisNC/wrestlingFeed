import { Show } from "@/components/Show/Show";
import {
  buildCalendarShows,
  formatLocalDateKey,
  getAppCalendarDate,
  getWrestlersForCalendar,
} from "@/lib/showCalendar";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export default async function Home() {
  const fetchDate = await getAppCalendarDate();
  const allWrestlers = await getWrestlersForCalendar();
  const shows = buildCalendarShows(fetchDate, allWrestlers);

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
