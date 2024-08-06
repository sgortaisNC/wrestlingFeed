import {Show} from "@/components/Show/Show";
import {prisma} from "@/utils/prisma";
import {Toast} from "@/components/Toast/Toast";

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
    yesterday.setDate(yesterday.getDate() - 32);
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
        },{
            date: "2024-5-25",
        },{
            date: "2024-6-9",
        }, {
            date: "2024-6-15",
        }, {
            date: "2024-7-6",
        }, {
            date: "2024-8-31",
        }, {
            date: "2024-9-1",
        }, {
            date: "2024-10-5",
        }, {
            date: "2024-10-27",
        }, {
            date: "2024-11-2",
        }
    ]

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
            <Toast text={"Test"} />
            <div className="grid">
                {shows.map(show => (
                    <Show show={show} key={show.date} className={"card " + show.title}/>
                ))}
            </div>
        </>
    );
}
