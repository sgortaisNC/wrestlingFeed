import { type NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET(_request: NextRequest) {
  try {
    const count = await prisma.match.count();
    return Response.json({ count });
  } catch (error) {
    console.error('Erreur lors du comptage des matches:', error);
    return Response.json(
      { error: 'Erreur lors du comptage des matches' },
      { status: 500 }
    );
  }
} 