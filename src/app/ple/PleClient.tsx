'use client';

import { useCallback, useEffect, useState } from 'react';
import css from './ple.module.scss';

type PleEvent = { id: number; dateKey: string; label: string };

export function PleClient() {
  const [events, setEvents] = useState<PleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [dateKey, setDateKey] = useState('');
  const [label, setLabel] = useState('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDateKey, setEditDateKey] = useState('');
  const [editLabel, setEditLabel] = useState('');

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch('/api/ple-events');
      if (!res.ok) throw new Error('Chargement impossible');
      const data = await res.json();
      setEvents(data.events ?? []);
    } catch {
      setError('Impossible de charger les PLE.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/ple-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, label }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Erreur à la création');
        return;
      }
      setDateKey('');
      setLabel('');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (ev: PleEvent) => {
    setEditingId(ev.id);
    setEditDateKey(ev.dateKey);
    setEditLabel(ev.label);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id: number) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/ple-events/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: editDateKey, label: editLabel }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(typeof data.error === 'string' ? data.error : 'Erreur à la mise à jour');
        return;
      }
      setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!window.confirm('Supprimer cette entrée PLE ?')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/ple-events/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(typeof data.error === 'string' ? data.error : 'Suppression impossible');
        return;
      }
      if (editingId === id) setEditingId(null);
      await load();
    } finally {
      setSaving(false);
    }
  };

  const formatFr = (dateKeyStr: string) => {
    const [y, m, d] = dateKeyStr.split('-').map(Number);
    if (!y || !m || !d) return dateKeyStr;
    return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className={css.container}>
      <h1 className={css.title}>PLE (Premium Live Events)</h1>
      <p className={css.intro}>
        Les dates renseignées ici ajoutent une carte « PLE » sur le calendrier d’accueil (en plus des shows
        hebdomadaires). Une seule PLE par jour calendaire.
      </p>

      {error && <p className={css.error}>{error}</p>}

      <form className={css.form} onSubmit={onSubmit}>
        <div className={css.formRow}>
          <label className={css.label}>
            Date
            <input
              className={css.input}
              type="date"
              value={dateKey}
              onChange={(e) => setDateKey(e.target.value)}
              required
            />
          </label>
          <label className={css.label}>
            Libellé
            <input
              className={css.textInput}
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="ex. WrestleMania 42 (Night 1)"
              required
            />
          </label>
          <button type="submit" className={css.submit} disabled={saving}>
            Ajouter
          </button>
        </div>
      </form>

      <h2 className={css.listTitle}>PLE programmées</h2>
      {loading ? (
        <p className={css.loading}>Chargement…</p>
      ) : events.length === 0 ? (
        <p className={css.empty}>Aucune PLE en base.</p>
      ) : (
        <table className={css.table}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Libellé</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {events.map((ev) =>
              editingId === ev.id ? (
                <tr key={ev.id} className={css.editRow}>
                  <td colSpan={3}>
                    <div className={css.editForm}>
                      <input
                        className={css.input}
                        type="date"
                        value={editDateKey}
                        onChange={(e) => setEditDateKey(e.target.value)}
                      />
                      <input
                        className={css.textInput}
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                      />
                      <button type="button" className={css.submit} disabled={saving} onClick={() => saveEdit(ev.id)}>
                        Enregistrer
                      </button>
                      <button type="button" className={css.btnDelete} disabled={saving} onClick={cancelEdit}>
                        Annuler
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                <tr key={ev.id}>
                  <td>{formatFr(ev.dateKey)}</td>
                  <td>{ev.label}</td>
                  <td>
                    <div className={css.actions}>
                      <button type="button" className={css.btnEdit} onClick={() => startEdit(ev)}>
                        Modifier
                      </button>
                      <button type="button" className={css.btnDelete} onClick={() => remove(ev.id)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
