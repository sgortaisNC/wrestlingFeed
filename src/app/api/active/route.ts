import {NextResponse} from "next/server";
import {prisma} from "@/Utils/prisma";
export async function PUT(request){
    const body = await request.json();
    const bdd = await prisma.wrestler.update({
        where: {id: parseInt(body.id)},
        data: {active: body.active === "1"}
    });

    return NextResponse.json(bdd);
}