import { Show } from "@/components/Show/Show";
import { prisma } from "@/utils/prisma";

async function getWrestlers() {
    return prisma.wrestler.findMany({
        orderBy: [
            {
                name: 'asc',
            }
        ],
        include: {
            match: true,
        },
    });
}

async function getDate() {
    const date = await prisma.options.findUnique({
        where: {
            key: "date"
        }
    })

    return date.value;
}

export const dynamic = 'force-dynamic'
export const revalidate = 60 // revalidate the data at most every minutes


export default async function Home() {

    const fetchDate = await getDate();

    const date = new Date(fetchDate);
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 2);
    const shows = [];
    const ple = [
    { date: "2025-10-11", event: "WWE Crown Jewel 2025 - Perth" },
    { date: "2025-11-29", event: "Survivor Series 2025 - San Diego, CA" },
    { date: "2025-11-1", event: "Saturday Night main event" },

        { date: "2025-10-25", event: "Halloween Havoc 2025" },
    ];


    let allWrestlers = await getWrestlers();

    while (date.getTime() < yesterday.getTime()) {
        date.setDate(date.getDate() + 1);

        let timeWresler = allWrestlers.filter((w) => {
            return w.match.length === 0 || w.match.at(-1)?.date.toISOString() !== date.toISOString()
        });


        let checkPLE = ple.filter((p) => p.date === (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()))
        if (checkPLE.length > 0) {
            shows.push({
                date: date.toISOString(),
                title: "PLE",
                wrestlers: timeWresler
            });
        }


        if (date.getDay() === 5) {
            shows.push({
                date: date.toISOString(),
                title: 'SmackDown',
                wrestlers: timeWresler
            });
        } else if (date.getDay() === 2) {
            shows.push({
                date: date.toISOString(),
                title: 'NXT',
                wrestlers: timeWresler
            });

        } else if (date.getDay() === 3) {
            shows.push({
                date: date.toISOString(),
                title: 'Evolve',
                wrestlers: timeWresler
            });
        } else if (date.getDay() === 1) {
            shows.push({
                date: date.toISOString(),
                title: 'Raw',
                wrestlers: timeWresler
            });
        }
    }

    return (
        <>
            <div className="grid">
                {shows.map(show => (
                    <Show show={show} key={show.date} className={"card " + show.title} />
                ))}
            </div>
        </>
    );
}
