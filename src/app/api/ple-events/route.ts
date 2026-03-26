import { prisma } from '@/utils/prisma';
import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

export async function GET() {
  try {
    const events = await prisma.pleEvent.findMany({ orderBy: { dateKey: 'asc' } });
    return NextResponse.json({ events });
  } catch (error) {
    console.error('GET /api/ple-events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    if (!body?.dateKey || typeof body.label !== 'string') {
      return NextResponse.json({ error: 'dateKey et label requis' }, { status: 400 });
    }
    if (!DATE_KEY_RE.test(String(body.dateKey))) {
      return NextResponse.json({ error: 'dateKey attendu au format YYYY-MM-DD' }, { status: 400 });
    }
    const label = String(body.label).trim();
    if (!label) {
      return NextResponse.json({ error: 'label vide' }, { status: 400 });
    }
    const created = await prisma.pleEvent.create({
      data: { dateKey: String(body.dateKey), label },
    });
    return NextResponse.json(created);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'Une PLE existe déjà à cette date' }, { status: 409 });
    }
    console.error('POST /api/ple-events:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
