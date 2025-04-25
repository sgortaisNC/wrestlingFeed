import {prisma} from "@/utils/prisma";
import {Match, Prisma, Wrestler} from "@prisma/client";
import { NextResponse } from 'next/server';

type WrestlerWithMatches = Wrestler & {
    match: Match[];
};

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

async function getMatchBeforeDate(date: Date | false = false) {
    try {
        let args: Prisma.WrestlerFindManyArgs = {
            include: {
                match: {
                    orderBy: {
                        date: 'desc' as Prisma.SortOrder
                    }
                }
            },
            where: {
                match: {
                    some: {} // On récupère d'abord tous les catcheurs avec des matches
                }
            },
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
        const wrestlers = await prisma.wrestler.findMany(args) as WrestlerWithMatches[];
        // On filtre ensuite pour ne garder que ceux avec au moins 2 matches
        return wrestlers.filter(w => w.match.length >= 2);
    } catch (error) {
        console.error('Erreur lors de la récupération des matches:', error);
        throw error;
    }
}

export const dynamic = 'force-dynamic'
export const revalidate = 120

export async function GET() {
    try {
        const bdd = await getMatchBeforeDate();
        const lastMatch = await prisma.match.findFirst({
            select: {
                date: true,
            },
            orderBy: {
                date: "desc"
            }
        });

        if (!lastMatch) {
            return NextResponse.json({ error: 'Aucun match trouvé' }, { status: 404 });
        }

        const lastDayMatch = lastMatch.date;
        console.log('Dernier match:', lastDayMatch);

        let totalMatch = 0;
        let maxMatch = 0;
        let returnable = []
        bdd.map(w => {
            totalMatch += w.match.length;
            maxMatch = Math.max(maxMatch, w.match.length);
            const lastMatch = w.match[0]; // Le premier match est le plus récent grâce au orderBy
            returnable.push({
                name: `${w.name}`,
                gender: w.gender || "male", // Valeur par défaut au cas où le champ est absent
                tier: getTier(w.match),
                pts: w.match.filter(m => m.win).length - w.match.filter(m => m.loose).length,
                matches: w.match.length,
                isActive: w.match.some((m) => {
                    return m.date.toUTCString() === lastDayMatch.toUTCString()
                }),
                lastResult: lastMatch?.win ? "Win" : lastMatch?.loose ? "Loose" : "Draw"
            })
        });

        const now = new Date();
        return NextResponse.json({
            dateAPI: now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds(),
            avg: totalMatch / bdd.length,
            tier: returnable.sort((a, b) => b.pts - a.pts),
            maxMatches: maxMatch
        });
    } catch (error) {
        console.error('Erreur dans l\'API tier:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
