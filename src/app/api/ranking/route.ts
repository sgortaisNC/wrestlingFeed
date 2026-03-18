import { prisma } from '@/utils/prisma';
import { Match, Wrestler } from '@prisma/client';
import { NextResponse } from 'next/server';

type WrestlerWithMatches = Wrestler & {
  match: Match[];
};

const THURSDAY = 4; // getDay(): 0 = dimanche, 4 = jeudi
const MULTIPLIER_PER_MATCH_SINCE_DEFEAT = 0.2;

/** Retourne les bornes de la semaine contenant la date de référence (jeudi 00:00 → mercredi 23:59:59) */
function getWeekBounds(referenceDate: Date): { start: Date; end: Date } {
  const d = new Date(referenceDate);
  const daysSinceThursday = (d.getDay() - THURSDAY + 7) % 7;
  const start = new Date(d);
  start.setDate(d.getDate() - daysSinceThursday);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  end.setMilliseconds(-1);
  return { start, end };
}

/** Retourne les bornes de la semaine précédente */
function getPreviousWeekBounds(currentWeekStart: Date): { start: Date; end: Date } {
  const prevStart = new Date(currentWeekStart);
  prevStart.setDate(currentWeekStart.getDate() - 7);
  const prevEnd = new Date(prevStart);
  prevEnd.setDate(prevStart.getDate() + 7);
  prevEnd.setMilliseconds(-1);
  return { start: prevStart, end: prevEnd };
}

function matchesBeforeDate(matches: Match[], endDate: Date): Match[] {
  return matches.filter((m) => {
    const d = new Date(m.date);
    return d <= endDate;
  });
}

/** Nombre de matchs depuis la dernière défaite (matchs ordonnés du plus récent au plus ancien) */
function nbMatchsDepuisDerniereDefaite(matches: Match[]): number {
  let count = 0;
  for (const match of matches) {
    if (match.loose) break;
    count++;
  }
  return count;
}

function calculateRankingScore(matches: Match[]): {
  totalScore: number;
  nbWin: number;
  nbLooses: number;
  nbMatchsDepuisDefaite: number;
  baseScore: number;
} {
  const nbWin = matches.filter((m) => m.win).length;
  const nbLooses = matches.filter((m) => m.loose).length;

  const baseScore = nbWin * 2 - nbLooses;

  const nbDepuisDefaite = nbMatchsDepuisDerniereDefaite(matches);
  const multiplier = 1 + MULTIPLIER_PER_MATCH_SINCE_DEFEAT * nbDepuisDefaite;
  const totalScore = baseScore * multiplier;

  return {
    totalScore,
    nbWin,
    nbLooses,
    nbMatchsDepuisDefaite: nbDepuisDefaite,
    baseScore,
  };
}

export const dynamic = 'force-dynamic';
export const revalidate = 120;

export async function GET() {
  try {
    const [wrestlers, lastMatch] = await Promise.all([
      prisma.wrestler.findMany({
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
      }),
      prisma.match.findFirst({
        orderBy: { date: 'desc' },
        select: { date: true },
      }),
    ]);

    const referenceDate = lastMatch?.date ?? new Date();
    const { start: currentStart, end: currentEnd } = getWeekBounds(referenceDate);
    const { start: prevStart, end: prevEnd } = getPreviousWeekBounds(currentStart);

    // Classement à la fin de la semaine précédente (matchs jusqu'au mercredi inclus)
    const rankingSemainePrecedente = wrestlers
      .map((w) => ({
        id: w.id,
        score: calculateRankingScore(matchesBeforeDate(w.match, prevEnd)).totalScore,
      }))
      .sort((a, b) => b.score - a.score);

    const positionSemainePrecedente = new Map<number, number>();
    rankingSemainePrecedente.forEach((w, index) => {
      positionSemainePrecedente.set(w.id, index + 1);
    });

    const ranking = wrestlers.map((w) => {
      const stats = calculateRankingScore(w.match);
      const matchPlusRecent = w.match[0];
      const matchPlusAncien = w.match[w.match.length - 1];
      const periodeMatchs =
        matchPlusRecent && matchPlusAncien
          ? {
              debut: matchPlusAncien.date,
              fin: matchPlusRecent.date,
            }
          : null;
      return {
        id: w.id,
        name: w.name,
        gender: w.gender || 'male',
        showName: w.showName || null,
        ...stats,
        periodeMatchs,
      };
    });

    ranking.sort((a, b) => b.totalScore - a.totalScore);

    // Ajouter la progression (places gagnées ou perdues)
    const rankingWithProgression = ranking.map((entry, index) => {
      const positionActuelle = index + 1;
      const positionPrecedente = positionSemainePrecedente.get(entry.id) ?? null;
      const progression =
        positionPrecedente !== null ? positionPrecedente - positionActuelle : null;
      return {
        ...entry,
        progression,
        positionSemainePrecedente: positionPrecedente,
      };
    });

    return NextResponse.json({
      ranking: rankingWithProgression,
      periodeActuelle: { start: currentStart, end: currentEnd },
      periodePrecedente: { start: prevStart, end: prevEnd },
    });
  } catch (error) {
    console.error("Erreur dans l'API ranking:", error);
    return NextResponse.json(
      { error: "Erreur lors du calcul du classement" },
      { status: 500 }
    );
  }
}
