import {prisma} from "@/utils/prisma";
import {Match} from "@prisma/client";

function percent(matches: Match[]): number {
    let wins = matches.filter(m => m.win).length;
    let looses = matches.filter(m => m.loose).length;
    return 100 * (wins / (wins + looses));
}

function getTier(matches: Match[]): string {
    const p = percent(matches);
    if (p > 90) return "S+";
    if (p > 70) return "S";
    if (p > 50) return "A";
    if (p > 30) return "B";
    if (p > 10) return "C";
    return "D";
}

async function getMatchBeforeDate(date = false) {
    let args = {
        select: {
            id: true,
            name: true,
            match: true,
        },
        where: {},
    }
    if (date) {
        args.where = {
            match: {
                some: {
                    date: {
                        lte: date
                    },
                }
            }
        }
    }
    return prisma.wrestler.findMany(args);
}

export const dynamic = 'force-dynamic'
export const revalidate = 120

export async function GET() {
    const bdd = await getMatchBeforeDate();
    const lastDayMatch = (await prisma.match.findFirst({
        select: {
            date: true,
        },
        orderBy: {
            date: "desc"
        }
    })).date

    console.log(lastDayMatch)

    let totalMatch = 0;
    let maxMatch = 0;
    let returnable = []
    bdd.map(w => {
        totalMatch += w.match.length;
        maxMatch = Math.max(maxMatch, w.match.length);
        returnable.push({
            name: `${w.name}`,
            tier: getTier(w.match),
            pts: w.match.filter(m => m.win).length - w.match.filter(m => m.loose).length,
            matches: w.match.length,
            isActive: w.match.some((m) => {
                return m.date.toUTCString() === lastDayMatch.toUTCString()
            }),
            lastResult: w.match[w.match.length - 1]?.win ? "Win" : "Loose"
        })
    });

    const now = new Date();
    return Response.json({
        dateAPI: now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds(),
        avg: totalMatch / bdd.length,
        tier: returnable.sort((a, b) => b.pts - a.pts),
        maxMatches: maxMatch
    });
}
