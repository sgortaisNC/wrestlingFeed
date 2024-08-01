import {NextResponse} from "next/server";
import {prisma} from "@/Utils/prisma";

function percent(matches){
    let wins = matches.filter(m => m.win).length;
    let looses = matches.filter(m => m.loose).length;
    return 100 * (wins / (wins+looses));
}
function getTier(matches){
    const p = percent(matches);
    if (p === 100) return "S+";
    if (p === 0) return "D";
    if (p < 25) return "C";
    if (p < 50) return "B";
    if (p < 75) return "A";
    return "S";
}
async function getMatchBeforeDate(date = false){
    let args = {
        select: {
            id: true,
            name: true,
            match: {
                select: {
                    date: true,
                    win: true,
                    loose: true,
                },
            }
        },
    }
    if (date){
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

export async function GET() {
    const date = await prisma.options.findUnique({
            select: {
                value: true
            },
            where: {
                key: "date"
            }
        }
    )

    const bdd = await getMatchBeforeDate();
    let totalMatch = 0;
    let returnable = []
    bdd.map(w => {
        totalMatch += w.match.length
        returnable.push({
            name: w.name,
            tier: getTier(w.match),
            pts: w.match.filter(m => m.win).length - w.match.filter(m => m.loose).length,
            matches: w.match.length
        })
    } );

    returnable = returnable.filter(w => w.matches > (totalMatch/bdd.length) - 1);
    console.log(returnable)

    return NextResponse.json({
        avg: totalMatch/bdd.length,
        tier: returnable.sort((a, b) => b.pts - a.pts),
    });
}
