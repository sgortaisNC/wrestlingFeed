import { NextResponse } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { win, loose, draw } = body;

    const match = await prisma.match.update({
      where: {
        id: parseInt(params.id),
      },
      data: {
        win,
        loose,
        draw,
      },
    });

    return NextResponse.json(match);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du match:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du match' },
      { status: 500 }
    );
  }
} 