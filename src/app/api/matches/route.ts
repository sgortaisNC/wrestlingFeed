import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export async function GET() {
  try {
    const matches = await prisma.match.findMany({
      include: {
        wrestler: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(matches);
  } catch (error) {
    console.error('Erreur lors de la récupération des matches:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des matches' },
      { status: 500 }
    );
  }
} 