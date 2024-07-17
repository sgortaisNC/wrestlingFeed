import {NextResponse} from "next/server";
import {parse} from 'node-html-parser';
import {prisma} from "@/Utils/prisma";

export async function GET(request) {
    const response = await fetch('https://www.thesmackdownhotel.com/roster/wwe/');
    const html = await response.text();
    const root = parse(html);
    const nodeWrestlers = root.querySelectorAll('.roster_name');
    let wrestlers = nodeWrestlers.map((nodeWrestler) => {
        return nodeWrestler.text;
    });

    let uniq = [...new Set(wrestlers)]

    for (let i = 0; i < uniq.length; i++) {
        await prisma.wrestler.create({
            data: {
                name: uniq[i],
                show: {
                    connect: {name: 'Free'}
                }
            }
        })
    }

   /* const doIt = await prisma.wrestler.createMany({
        data: uniq.map((nom) => {
            return {
                name: nom,
                show: {
                    connect: {name: 'Free'}
                }
            }
        })
    console.log(doIt);
    })*/

    return NextResponse.json({message: 'Import terminé'});
}
