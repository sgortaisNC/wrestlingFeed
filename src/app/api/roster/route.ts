import {NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
export async function PUT(request){
    const body = await request.json();

    const bdd = await prisma.wrestler.update({
        where: {id: parseInt(body.id)},
        data: {show: {connect: {name: body.roster}}}
    });
console.log(body.roster)
    console.log(bdd)

    return NextResponse.json(bdd);
}
