'use client';

import { useEffect, useState } from 'react';
import { Match, Wrestler } from '@prisma/client';

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
        method: 'PATCH',
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

  if (loading) {
    return <div className="p-4">Chargement...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Correction des Matches</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 border">Date</th>
              <th className="px-4 py-2 border">Catcheur</th>
              <th className="px-4 py-2 border">Résultat</th>
              <th className="px-4 py-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 border">
                  {formatDate(match.date)}
                </td>
                <td className="px-4 py-2 border">{match.wrestler.name}</td>
                <td className="px-4 py-2 border">
                  {match.win ? 'Victoire' : match.loose ? 'Défaite' : 'Match nul'}
                </td>
                <td className="px-4 py-2 border">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleCorrection(match.id, { win: true, loose: false, draw: false })}
                      className={`px-2 py-1 rounded ${match.win ? 'bg-green-500 text-white' : 'bg-gray-200'}`}
                    >
                      Victoire
                    </button>
                    <button
                      onClick={() => handleCorrection(match.id, { win: false, loose: true, draw: false })}
                      className={`px-2 py-1 rounded ${match.loose ? 'bg-red-500 text-white' : 'bg-gray-200'}`}
                    >
                      Défaite
                    </button>
                    <button
                      onClick={() => handleCorrection(match.id, { win: false, loose: false, draw: true })}
                      className={`px-2 py-1 rounded ${match.draw ? 'bg-yellow-500 text-white' : 'bg-gray-200'}`}
                    >
                      Match nul
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