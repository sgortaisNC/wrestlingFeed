import {NextResponse} from "next/server";
import {prisma} from "@/Utils/prisma";

export async function POST(request) {
    const body = await request.json();
    const bdd = await prisma.wrestler.create({
        data: {
            name: body.name,
            show: {
                connect: {
                    name: body.showName
                }
            },
            active: true,
            lastSeen: body.lastSeen
        }
    });
    return NextResponse.json(bdd);
}
