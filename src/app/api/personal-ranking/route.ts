import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const wrestlers = await prisma.wrestler.findMany({
            select: {
                id: true,
                name: true,
                gender: true,
                showName: true,
                personalRank: true,
            },
            orderBy: [
                { personalRank: 'asc' },
                { name: 'asc' },
            ],
        });
        return NextResponse.json(wrestlers, {
            headers: { 'Cache-Control': 'no-store' },
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du classement personnel:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}

// Body: { rankings: [{ id: number, rank: number }] }
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { rankings } = body as { rankings: { id: number; rank: number }[] };

        if (!Array.isArray(rankings)) {
            return NextResponse.json({ error: 'Format invalide' }, { status: 400 });
        }

        // Normalise et écarte les entrées invalides (id/rank non entiers).
        const valid = rankings
            .map(({ id, rank }) => ({ id: Number(id), rank: Number(rank) }))
            .filter(({ id, rank }) => Number.isInteger(id) && Number.isInteger(rank));

        if (valid.length === 0) {
            return NextResponse.json({ success: true, updated: 0 });
        }

        // Un seul UPDATE ... CASE au lieu de N updates dans une transaction :
        // un unique aller-retour SQL, ce qui évite le timeout (504) de la
        // fonction serverless sur ~140 catcheurs.
        const cases = valid.map(({ id, rank }) => Prisma.sql`WHEN ${id} THEN ${rank}`);
        const ids = valid.map(({ id }) => id);

        const updated = await prisma.$executeRaw`
            UPDATE "Wrestler"
            SET "personalRank" = CASE "id" ${Prisma.join(cases, ' ')} ELSE "personalRank" END
            WHERE "id" IN (${Prisma.join(ids)})
        `;

        return NextResponse.json({ success: true, updated });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du classement personnel:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
