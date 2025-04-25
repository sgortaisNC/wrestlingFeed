import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export async function PUT(
    request: Request,
    context: { params: { id: string } }
) {
    try {
        const { name, show } = await request.json();
        const id = parseInt(context.params.id);

        const updatedWrestler = await prisma.wrestler.update({
            where: { id },
            data: { name, show }
        });

        return NextResponse.json(updatedWrestler);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du wrestler:', error);
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 