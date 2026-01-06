import { prisma } from '@/utils/prisma';

export async function GET() {
    try {
        const count = await prisma.wrestler.count();
        return Response.json({ count });
    } catch (error) {
        console.error('Erreur lors de la récupération du nombre de wrestlers:', error);
        return Response.json({ error: 'Erreur serveur' }, { status: 500 });
    }
} 