'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import css from './style.module.scss';

interface RankingEntry {
  id: number;
  name: string;
  gender: string;
  showName: string | null;
  totalScore: number;
  nbWin: number;
  nbLooses: number;
  nbMatchsDepuisDefaite: number;
  baseScore: number;
  progression: number | null;
  positionSemainePrecedente: number | null;
  periodeMatchs: { debut: string; fin: string } | null;
}

interface RankingResponse {
  ranking: RankingEntry[];
  periodeActuelle: { start: string; end: string };
  periodePrecedente: { start: string; end: string };
}

const DIVISIONS = ['Raw', 'SmackDown', 'NXT', 'Evolve'] as const;

function normalizeDivision(showName: string | null): (typeof DIVISIONS)[number] {
  if (!showName) return 'Evolve';
  const normalized = showName.toLowerCase().trim();
  if (normalized.includes('raw')) return 'Raw';
  if (normalized.includes('smackdown') || normalized.includes('smack down')) return 'SmackDown';
  if (normalized.includes('nxt')) return 'NXT';
  return 'Evolve';
}

export function DivisionsClient() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/ranking');
        const data: RankingResponse = await response.json();
        setRanking(data.ranking);
      } catch (error) {
        console.error('Erreur lors de la récupération du classement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  const byDivision = DIVISIONS.reduce(
    (acc, div) => {
      acc[div] = ranking
        .filter((e) => normalizeDivision(e.showName) === div)
        .sort((a, b) => b.totalScore - a.totalScore);
      return acc;
    },
    {} as Record<(typeof DIVISIONS)[number], RankingEntry[]>
  );

  if (loading) {
    return (
      <div className={css.container}>
        <h1 className={css.title}>Classement par divisions</h1>
        <div className={css.loading}>Chargement...</div>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <h1 className={css.title}>
        <span>Classement</span>
        <Link href="/ranking/table" className={css.tableLink}>
          Tableau complet
        </Link>
      </h1>
      <div className={css.grid}>
        {DIVISIONS.map((division) => (
          <div key={division} className={css.column}>
            <h2 className={css.divisionTitle}>{division}</h2>
            <ul className={css.list}>
              {byDivision[division].map((entry, index) => (
                <li
                  key={entry.id}
                  className={`${css.item} ${entry.gender === 'female' ? css.female : css.male}`}
                  title={
                    entry.positionSemainePrecedente
                      ? `${entry.positionSemainePrecedente}e la semaine passée → ${entry.progression !== null && entry.progression > 0 ? '+' : ''}${entry.progression} place(s)`
                      : 'Nouveau dans le classement'
                  }
                >
                  <span className={css.rank}>
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                    {index > 2 && index + 1}
                  </span>
                  <span className={css.name}>{entry.name}</span>
                  <span
                    className={`${css.progression} ${entry.progression !== null && entry.progression > 0 ? css.progressionUp : entry.progression !== null && entry.progression < 0 ? css.progressionDown : ''}`}
                  >
                    {entry.progression === null
                      ? '—'
                      : entry.progression > 0
                        ? `+${entry.progression}`
                        : entry.progression}
                  </span>
                  <span className={css.score}>{entry.totalScore.toFixed(1)}</span>
                </li>
              ))}
              {byDivision[division].length === 0 && (
                <li className={css.empty}>Aucun wrestler</li>
              )}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
