import { prisma } from '@/utils/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'id invalide' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Corps JSON attendu' }, { status: 400 });
    }

    const data: { dateKey?: string; label?: string } = {};
    if ('dateKey' in body && body.dateKey != null) {
      if (!DATE_KEY_RE.test(String(body.dateKey))) {
        return NextResponse.json({ error: 'dateKey attendu au format YYYY-MM-DD' }, { status: 400 });
      }
      data.dateKey = String(body.dateKey);
    }
    if ('label' in body && body.label != null) {
      const label = String(body.label).trim();
      if (!label) {
        return NextResponse.json({ error: 'label vide' }, { status: 400 });
      }
      data.label = label;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à modifier' }, { status: 400 });
    }

    const updated = await prisma.pleEvent.update({
      where: { id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return NextResponse.json({ error: 'PLE introuvable' }, { status: 404 });
      }
      if (error.code === 'P2002') {
        return NextResponse.json({ error: 'Une PLE existe déjà à cette date' }, { status: 409 });
      }
    }
    console.error('PATCH /api/ple-events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  const { id: idParam } = await params;
  const id = parseInt(idParam, 10);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: 'id invalide' }, { status: 400 });
  }

  try {
    await prisma.pleEvent.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return NextResponse.json({ error: 'PLE introuvable' }, { status: 404 });
    }
    console.error('DELETE /api/ple-events/[id]:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
