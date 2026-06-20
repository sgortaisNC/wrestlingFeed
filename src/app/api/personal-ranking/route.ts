import { NextRequest, NextResponse } from 'next/server';
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

        await prisma.$transaction(
            rankings.map(({ id, rank }) =>
                prisma.wrestler.update({
                    where: { id },
                    data: { personalRank: rank },
                })
            )
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du classement personnel:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
}
