import {NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";

export async function POST(request) {
    const body = await request.json();
    const bdd = await prisma.match.create({
        data: {
            win: body.win,
            draw: body.draw,
            loose: body.loose,
            date: body.date,
            wrestler: {
                connect: {
                    id: parseInt(body.wrestlerId)
                }
            }
        }
    });
    return NextResponse.json(bdd);
}
