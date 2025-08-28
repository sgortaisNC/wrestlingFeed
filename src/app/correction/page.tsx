'use client';

import { useEffect, useState } from 'react';
import { Match, Wrestler } from '@prisma/client';
import styles from './correction.module.scss';

type MatchWithWrestler = Match & {
  wrestler: Wrestler;
};

export default function CorrectionPage() {
  const [matches, setMatches] = useState<MatchWithWrestler[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const fetchMatches = async () => {
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      setMatches(data);
    } catch (error) {
      console.error('Erreur lors du chargement des matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCorrection = async (matchId: number, correction: { win?: boolean; loose?: boolean; draw?: boolean }) => {
    try {
      const response = await fetch(`/api/matches/${matchId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(correction),
      });

      if (response.ok) {
        fetchMatches();
      }
    } catch (error) {
      console.error('Erreur lors de la correction:', error);
    }
  };

  const handleDelete = async (matchId: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
      try {
        const response = await fetch(`/api/matches/${matchId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchMatches();
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  if (loading) {
    return <div className={styles.loading}>Chargement...</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Correction des Matches</h1>
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr className={styles.header}>
              <th className={styles.headerCell}>Date</th>
              <th className={styles.headerCell}>Catcheur</th>
              <th className={styles.headerCell}>Résultat</th>
              <th className={styles.headerCell}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className={styles.row}>
                <td className={styles.cell}>
                  {formatDate(match.date)}
                </td>
                <td className={styles.cell}>{match.wrestler.name}</td>
                <td className={styles.cell}>
                  {match.win ? 'Victoire' : match.loose ? 'Défaite' : 'Match nul'}
                </td>
                <td className={styles.cell}>
                  <div className={styles.buttonContainer}>
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => handleCorrection(match.id, { win: true, loose: false, draw: false })}
                        className={`${styles.button} ${match.win ? styles.win : styles.default}`}
                      >
                        Victoire
                      </button>
                      <button
                        onClick={() => handleCorrection(match.id, { win: false, loose: true, draw: false })}
                        className={`${styles.button} ${match.loose ? styles.lose : styles.default}`}
                      >
                        Défaite
                      </button>
                    </div>
                    <button
                      onClick={() => handleDelete(match.id)}
                      className={`${styles.button} ${styles.delete}`}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 