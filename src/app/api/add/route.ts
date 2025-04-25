import {NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";

export async function POST(request) {
    const body = await request.json();
    const bdd = await prisma.wrestler.create({
        data: {
            name: body.name,
            gender: body.gender || "male",
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
