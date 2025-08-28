import { type NextRequest } from 'next/server';
import { prisma } from '@/utils/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const match = await prisma.match.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        wrestler: true,
      },
    });

    if (!match) {
      return Response.json({ error: 'Match non trouvé' }, { status: 404 });
    }

    return Response.json(match);
  } catch (error) {
    console.error('Erreur lors de la récupération du match:', error);
    return Response.json(
      { error: 'Erreur lors de la récupération du match' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { win, loose, draw } = body;

    const match = await prisma.match.update({
      where: {
        id: parseInt(id),
      },
      data: {
        win,
        loose,
        draw,
      },
    });

    return Response.json(match);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du match:', error);
    return Response.json(
      { error: 'Erreur lors de la mise à jour du match' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const match = await prisma.match.delete({
      where: {
        id: parseInt(id),
      },
    });

    return Response.json({ message: 'Match supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du match:', error);
    return Response.json(
      { error: 'Erreur lors de la suppression du match' },
      { status: 500 }
    );
  }
} 