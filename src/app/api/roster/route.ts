import {NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
export async function PUT(request){
    const body = await request.json();

    const bdd = await prisma.wrestler.update({
        where: {id: parseInt(body.id)},
        data: {show: {connect: {name: body.roster}}}
    });


    return NextResponse.json(bdd);
}
