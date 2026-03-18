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

function formatPeriod(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  return `${s.getDate()}/${s.getMonth() + 1} - ${e.getDate()}/${e.getMonth() + 1}`;
}

function formatDateShort(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
}

export function RankingClient() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [periods, setPeriods] = useState<{
    actuelle: string;
    precedente: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/ranking');
        const data: RankingResponse = await response.json();
        setRanking(data.ranking);
        setPeriods({
          actuelle: formatPeriod(data.periodeActuelle.start, data.periodeActuelle.end),
          precedente: formatPeriod(data.periodePrecedente.start, data.periodePrecedente.end),
        });
      } catch (error) {
        console.error('Erreur lors de la récupération du classement:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className={css.container}>
        <h1 className={css.title}>Classement</h1>
        <div className={css.loading}>Chargement du classement...</div>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <h1 className={css.title}>
        Classement
        <Link href="/ranking/divisions" className={css.divisionsLink}>
          Par divisions
        </Link>
      </h1>
      <p className={css.formula}>
        Score = (W×2 − L) × (1 + 0,2 × matchs depuis dernière défaite).
        {periods && (
          <span className={css.periodInfo}>
            {' '}Semaines jeudi→jeudi. Actuelle : {periods.actuelle} • Précédente : {periods.precedente}
          </span>
        )}
      </p>
      <div className={css.tableWrapper}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Superstar</th>
              <th>Score</th>
              <th title="Places gagnées (+) ou perdues (-) depuis la semaine passée">Progression</th>
              <th title="Période entre le match le plus ancien et le plus récent">Période</th>
              <th>W</th>
              <th>L</th>
              <th title="Nombre de matchs depuis la dernière défaite">Matchs depuis dernière défaite</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((entry, index) => (
              <tr
                key={entry.id}
                className={
                  entry.gender === 'female' ? css.female : css.male
                }
              >
                <td className={css.rank}>
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                  {index > 2 && index + 1}
                </td>
                <td className={css.name}>{entry.name}</td>
                <td className={css.score}>
                  <span className={css.scoreWithTooltip}>
                    {entry.totalScore.toFixed(2)}
                    <span className={css.tooltip}>
                      <strong>{entry.baseScore} × {(1 + 0.2 * entry.nbMatchsDepuisDefaite).toFixed(2)} = {entry.totalScore.toFixed(2)}</strong>
                    </span>
                  </span>
                </td>
                <td
                  className={`${css.progression} ${entry.progression !== null && entry.progression > 0 ? css.progressionUp : entry.progression !== null && entry.progression < 0 ? css.progressionDown : ''}`}
                  title={
                    entry.positionSemainePrecedente
                      ? `${entry.positionSemainePrecedente}e la semaine passée → ${entry.progression !== null && entry.progression > 0 ? '+' : ''}${entry.progression} place(s)`
                      : 'Nouveau dans le classement'
                  }
                >
                  {entry.progression === null
                    ? '—'
                    : entry.progression > 0
                      ? `+${entry.progression}`
                      : entry.progression}
                </td>
                <td className={css.periode} title={entry.periodeMatchs ? `${formatDateShort(entry.periodeMatchs.debut)} → ${formatDateShort(entry.periodeMatchs.fin)}` : ''}>
                  {entry.periodeMatchs
                    ? `${formatDateShort(entry.periodeMatchs.debut)} - ${formatDateShort(entry.periodeMatchs.fin)}`
                    : '—'}
                </td>
                <td>{entry.nbWin}</td>
                <td>{entry.nbLooses}</td>
                <td className={css.form} title={`${entry.nbMatchsDepuisDefaite} match(s) depuis la dernière défaite → ×${(1 + 0.2 * entry.nbMatchsDepuisDefaite).toFixed(2)}`}>
                  <span className={entry.nbMatchsDepuisDefaite >= 3 ? css.formHot : entry.nbMatchsDepuisDefaite === 0 ? css.formCold : css.formNeutral}>
                    {entry.nbMatchsDepuisDefaite}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
