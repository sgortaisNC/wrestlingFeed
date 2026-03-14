import { prisma } from '@/utils/prisma';
import { Match, Wrestler } from '@prisma/client';
import { NextResponse } from 'next/server';

type WrestlerWithMatches = Wrestler & {
  match: Match[];
};

const WEIGHTS_LAST_5 = [5, 4, 3, 2, 1]; // Le match le plus récent pèse le plus

function getMatchPoints(match: Match): number {
  if (match.win) return 3;
  if (match.loose) return -1;
  return 1; // draw
}

function calculateRankingScore(matches: Match[]): {
  totalScore: number;
  nbWin: number;
  nbLooses: number;
  nbDraw: number;
  formPonderee: number;
  baseScore: number;
} {
  const nbWin = matches.filter((m) => m.win).length;
  const nbLooses = matches.filter((m) => m.loose).length;
  const nbDraw = matches.filter((m) => m.draw).length;

  const baseScore = nbWin * 3 - nbLooses + nbDraw;

  // Forme pondérée sur les 5 derniers matchs (les plus récents comptent plus)
  const last5Matches = matches.slice(0, 5);
  let weightedSum = 0;
  let weightSum = 0;

  last5Matches.forEach((match, index) => {
    const weight = WEIGHTS_LAST_5[index];
    weightedSum += weight * getMatchPoints(match);
    weightSum += weight;
  });

  const formPonderee = weightSum > 0 ? weightedSum / weightSum : 0;
  const multiplier = 1 + formPonderee * 0.03;
  const totalScore = baseScore * multiplier;

  return {
    totalScore,
    nbWin,
    nbLooses,
    nbDraw,
    formPonderee,
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
