'use client';

import { useEffect, useState } from 'react';
import css from './style.module.scss';

interface RankingEntry {
  id: number;
  name: string;
  gender: string;
  totalScore: number;
  nbWin: number;
  nbLooses: number;
  nbDraw: number;
  formPonderee: number;
  baseScore: number;
}

export function RankingClient() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        const response = await fetch('/api/ranking');
        const data = await response.json();
        setRanking(data);
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
      <h1 className={css.title}>Classement</h1>
      <p className={css.formula}>
        Score = (W×3 − L + D) × (1 + 0,03 × forme pondérée). Forme = moyenne pondérée des 5 derniers matchs (le plus récent pèse 5×).
      </p>
      <div className={css.tableWrapper}>
        <table className={css.table}>
          <thead>
            <tr>
              <th>#</th>
              <th>Superstar</th>
              <th>Score</th>
              <th>W</th>
              <th>L</th>
              <th>D</th>
              <th>Forme</th>
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
                      <strong>{entry.baseScore} × {(1 + entry.formPonderee * 0.03).toFixed(2)} = {entry.totalScore.toFixed(2)}</strong>
                    </span>
                  </span>
                </td>
                <td>{entry.nbWin}</td>
                <td>{entry.nbLooses}</td>
                <td>{entry.nbDraw}</td>
                <td className={css.form} title="Forme pondérée sur les 5 derniers matchs (max 3 = 5V, min -1 = 5L)">
                  <span className={entry.formPonderee >= 2 ? css.formHot : entry.formPonderee <= 0 ? css.formCold : css.formNeutral}>
                    {entry.formPonderee.toFixed(2)}
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
