import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export async function GET() {
    try {
        const wrestlers = await prisma.wrestler.findMany({
            orderBy: {
                name: 'asc'
            }
        });
        return NextResponse.json(wrestlers);
    } catch (error) {
        console.error('Erreur lors de la récupération des wrestlers:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 