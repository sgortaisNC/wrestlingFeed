import { prisma } from '@/utils/prisma';
import { Match, Wrestler } from '@prisma/client';
import { NextResponse } from 'next/server';

type WrestlerWithMatches = Wrestler & {
  match: Match[];
};

function calculateRankingScore(matches: Match[]): {
  totalScore: number;
  nbWin: number;
  nbLooses: number;
  nbDraw: number;
  nbWinsInLast10: number;
  baseScore: number;
} {
  const nbWin = matches.filter((m) => m.win).length;
  const nbLooses = matches.filter((m) => m.loose).length;
  const nbDraw = matches.filter((m) => m.draw).length;

  const baseScore = nbWin * 5 - nbLooses * 3 + nbDraw;

  const last10Matches = matches.slice(0, 10);
  const nbWinsInLast10 = last10Matches.filter((m) => m.win).length;

  const multiplier = 1 + 0.2 * nbWinsInLast10;
  const totalScore = baseScore * multiplier;

  return {
    totalScore,
    nbWin,
    nbLooses,
    nbDraw,
    nbWinsInLast10,
    baseScore,
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 120;

export async function GET() {
  try {
    const wrestlers = (await prisma.wrestler.findMany({
      include: {
        match: {
          orderBy: {
            date: 'desc',
          },
        },
      },
      where: {
        match: {
          some: {},
        },
      },
    })) as WrestlerWithMatches[];

    const ranking = wrestlers.map((w) => {
      const stats = calculateRankingScore(w.match);
      return {
        id: w.id,
        name: w.name,
        gender: w.gender || 'male',
        ...stats,
      };
    });

    ranking.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json(ranking);
  } catch (error) {
    console.error("Erreur dans l'API ranking:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul du classement" },
      { status: 500 }
    );
  }
}
