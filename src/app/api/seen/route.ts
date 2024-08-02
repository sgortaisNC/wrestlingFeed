import {NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
export async function PUT(request){
    const body = await request.json();

    const bdd = await prisma.wrestler.update({
        where: {id: parseInt(body.id)},
        data: {lastSeen: new Date(body.date)}
    });

    return NextResponse.json(bdd);
}
