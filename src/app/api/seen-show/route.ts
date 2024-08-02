import {NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";
export async function POST(request){
    const body = await request.json();

    const bdd = await prisma.options.update({
        where: {key: "date"},
        data: {value: body.date}
    });

    return NextResponse.json(bdd);
}
