import {NextResponse} from "next/server";
import {prisma} from "@/Utils/prisma";

export async function DELETE(request) {
    const body = await request.json();

    const deleteMatches = await prisma.match.deleteMany({
            where: {
                wrestlerId: parseInt(body.id)
            }
        }
    )

    const bdd = await prisma.wrestler.delete({
        where: {id: parseInt(body.id)}
    });

    return NextResponse.json(bdd);
}
