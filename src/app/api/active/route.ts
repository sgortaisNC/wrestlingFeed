import {NextRequest, NextResponse} from "next/server";
import {prisma} from "@/utils/prisma";

export async function PUT(request: NextRequest) {
    const body = await request.json();
    const bdd = await prisma.wrestler.update({
        where: {id: parseInt(body.id)},
        data: {active: body.active === "1"}
    });

    return NextResponse.json(bdd);
}
