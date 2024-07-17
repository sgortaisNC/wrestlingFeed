import {Show} from "@/components/Show/Show";
import {prisma} from "@/Utils/prisma";
import DomElements from "@/components/DomElements/DomElements";

async function getWrestlers() {
    const wrestlers = await prisma.wrestler.findMany({
        orderBy: [
            {
                name: 'asc',
            },
        ],
        where: {
            active: true
        },
        include: {
            match: true,
        },
    });

    for (const wrestler of wrestlers) {
        wrestler.matches = wrestler.match.length;
        wrestler.wins = wrestler.match.filter(match => match.win).length;
    }
    return wrestlers;
}

export default async function Home() {
    const date = new Date('2024-04-07');
    let yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 32);

    let maxShows = 0;

    const wrestlers = await getWrestlers();
    const shows = [];
    const ple = [
        {
            date: "2024-1-27",
        }, {
            date: "2024-2-4",
        },
        {
            date: "2024-2-24",
        }, {
            date: "2024-4-6",
        },
        {
            date: "2024-4-7",
        }, {
            date: "2024-5-4",
        }, {
            date: "2024-6-15",
        }, {
            date: "2024-7-6",
        }, {
            date: "2024-8-31",
        }
    ]
    while (date.getTime() < yesterday.getTime()) {
        date.setDate(date.getDate() + 1);
        let checkPLE = ple.filter((p) => p.date === (date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()))
        if (checkPLE.length > 0) {
            shows.push({
                date: date.toISOString(),
                title: "PLE"
            });
        }
        if (date.getDay() === 5) {
            shows.push({
                date: date.toISOString(),
                title: 'SmackDown'
            });
        } else if (date.getDay() === 2) {
            shows.push({
                date: date.toISOString(),
                title: 'NXT'
            });
        } else if (date.getDay() === 1) {
            shows.push({
                date: date.toISOString(),
                title: 'Raw'
            });
        }
    }

    return (
        <>
            <DomElements />
            <div className="grid">
                {shows.map(show => (
                    <Show allWrestlers={wrestlers} show={show} key={show.date} className={"card " + show.title}/>
                ))}
            </div>
        </>
    );
}
