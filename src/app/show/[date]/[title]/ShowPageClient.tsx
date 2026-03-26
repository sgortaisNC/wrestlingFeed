'use client';

import { Wrestler } from '@/components/Wrestler/Wrestler';
import type { CalendarShow, CalendarWrestler } from '@/lib/showCalendar';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import css from './ShowPageClient.module.scss';

function lastSeenDelta(date1: string | Date | null, date2: string | Date) {
  if (!date1) return Number.POSITIVE_INFINITY;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);
}

function isInactive(wrestler: { lastSeen: string | Date | null }, showDate: string | Date) {
  if (!wrestler.lastSeen) return true;
  return lastSeenDelta(wrestler.lastSeen, showDate) >= 35;
}

function sameLocalDay(a: string | Date, b: string | Date) {
  return new Date(a).toLocaleDateString() === new Date(b).toLocaleDateString();
}

function noMatchOnShowDay(w: CalendarWrestler, showDate: string | Date) {
  return !w.match.some((m) => sameLocalDay(m.date, showDate));
}

function showSeen(date: string) {
  fetch('/api/seen-show', {
    method: 'POST',
    body: JSON.stringify({ date: date.substring(0, 10) }),
  });
}

function wrestlerIcon(lastSeen: string | Date | null, showDate: string | Date) {
  let icon = '👻';
  if (lastSeenDelta(lastSeen, showDate) < 35) icon = '🚑';
  if (lastSeenDelta(lastSeen, showDate) < 14) icon = '😴';
  if (lastSeenDelta(lastSeen, showDate) <= 7) icon = '🔥';
  return icon;
}

type ShowPageClientProps = { show: CalendarShow };

const DT_WRESTLER_ID = 'application/wrestler-id';

function setDragPayload(e: React.DragEvent, id: number) {
  const s = String(id);
  e.dataTransfer.setData(DT_WRESTLER_ID, s);
  e.dataTransfer.setData('text/plain', s);
}

function readDragWrestlerId(dt: DataTransfer): number {
  const raw = dt.getData(DT_WRESTLER_ID) || dt.getData('text/plain');
  const id = parseInt(raw, 10);
  return Number.isNaN(id) ? NaN : id;
}

export function ShowPageClient({ show }: ShowPageClientProps) {
  const router = useRouter();
  const showDate = show.date;
  const dragKindRef = useRef<'pool' | null>(null);

  const filteredWrestlers = useMemo(
    () => show.wrestlers.filter((w) => noMatchOnShowDay(w, showDate)),
    [show.wrestlers, showDate]
  );

  const [showMarkedAsSeen, setShowMarkedAsSeen] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [deleteDragOver, setDeleteDragOver] = useState(false);

  const [lineup, setLineup] = useState<CalendarWrestler[]>(() =>
    filteredWrestlers.filter((w) => w.lastSeen && sameLocalDay(w.lastSeen, showDate))
  );

  useEffect(() => {
    const next = filteredWrestlers.filter(
      (w) => w.lastSeen && sameLocalDay(w.lastSeen, showDate)
    );
    setLineup((prev) => {
      const merged = [...next];
      for (const p of prev) {
        if (!next.some((n) => n.id === p.id) && filteredWrestlers.some((f) => f.id === p.id)) {
          merged.push(p);
        }
      }
      return merged.filter((w, i, arr) => arr.findIndex((x) => x.id === w.id) === i);
    });
  }, [filteredWrestlers, showDate]);

  const lineupIds = useMemo(() => new Set(lineup.map((w) => w.id)), [lineup]);

  const leftPool = useMemo(
    () => filteredWrestlers.filter((w) => !lineupIds.has(w.id)),
    [filteredWrestlers, lineupIds]
  );

  const inactiveSection = useMemo(() => {
    return leftPool.filter((w) => isInactive(w, showDate)).sort((a, b) => a.name.localeCompare(b.name));
  }, [leftPool, showDate]);

  const rosterSection = useMemo(() => {
    return leftPool
      .filter((w) => !isInactive(w, showDate) && w.showName === show.title)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [leftPool, showDate, show.title]);

  const autresByDivision = useMemo(() => {
    const list = leftPool.filter(
      (w) => !isInactive(w, showDate) && w.showName !== show.title
    );
    const map = new Map<string, CalendarWrestler[]>();
    for (const w of list) {
      const key = w.showName?.trim() || 'Sans division';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(w);
    }
    const groups = [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, wrestlers]) => ({
        name,
        wrestlers: wrestlers.sort((a, b) => a.name.localeCompare(b.name)),
      }));
    return groups;
  }, [leftPool, showDate, show.title]);

  const handleAfterMatch = useCallback(
    (id: number) => {
      setLineup((prev) => prev.filter((w) => w.id !== id));
      router.refresh();
    },
    [router]
  );

  const handleShowSeen = () => {
    showSeen(show.date);
    setShowMarkedAsSeen(true);
    setTimeout(() => setShowMarkedAsSeen(false), 2000);
  };

  const endDragSession = useCallback(() => {
    dragKindRef.current = null;
    setDragOver(false);
    setDeleteDragOver(false);
  }, []);

  /** Capture : les enfants (p, ul, li) reçoivent le drag sinon sans preventDefault le drop est refusé. */
  const onDragOverPresentCapture = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragKindRef.current === 'pool') {
      e.dataTransfer.dropEffect = 'move';
      setDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDragOver(false);
    }
  };

  const onDragLeavePresent = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setDragOver(false);
    }
  };

  const onDropPresentCapture = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const kind = dragKindRef.current;
    endDragSession();
    if (kind !== 'pool') return;

    const id = readDragWrestlerId(e.dataTransfer);
    if (Number.isNaN(id)) return;

    const w = show.wrestlers.find((x) => x.id === id);
    if (!w || !noMatchOnShowDay(w, showDate)) return;
    if (lineupIds.has(id)) return;

    void (async () => {
      try {
        const res = await fetch('/api/seen', {
          method: 'PUT',
          body: JSON.stringify({ id: String(id), date: showDate }),
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return;
        const updated = await res.json();
        setLineup((prev) => {
          if (prev.some((p) => p.id === id)) return prev;
          return [...prev, { ...w, lastSeen: updated.lastSeen }];
        });
        router.refresh();
      } catch {
        /* ignore */
      }
    })();
  };

  const onDragOverDeleteCapture = (e: React.DragEvent) => {
    e.preventDefault();
    if (dragKindRef.current === 'pool') {
      e.dataTransfer.dropEffect = 'move';
      setDeleteDragOver(true);
    } else {
      e.dataTransfer.dropEffect = 'none';
      setDeleteDragOver(false);
    }
  };

  const onDragLeaveDelete = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      setDeleteDragOver(false);
    }
  };

  const onDropDeleteCapture = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const kind = dragKindRef.current;
    endDragSession();
    if (kind !== 'pool') return;

    const id = readDragWrestlerId(e.dataTransfer);
    if (Number.isNaN(id)) return;

    if (lineupIds.has(id)) return;

    const dropped = leftPool.find((w) => w.id === id) ?? show.wrestlers.find((w) => w.id === id);
    const label = dropped?.name ?? 'cette superstar';
    const ok = window.confirm(
      `Supprimer « ${label} » de la base et effacer tous ses matchs ?\n\nCette action est définitive.`
    );
    if (!ok) return;

    void (async () => {
      try {
        const res = await fetch('/api/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: String(id) }),
        });
        if (!res.ok) return;
        setLineup((prev) => prev.filter((w) => w.id !== id));
        router.refresh();
      } catch {
        /* ignore */
      }
    })();
  };

  const formattedDate = new Date(show.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const renderDragRow = (w: CalendarWrestler) => (
    <li key={w.id}>
      <div
        className={css.dragRow}
        draggable
        onDragStart={(e) => {
          dragKindRef.current = 'pool';
          setDragPayload(e, w.id);
          e.dataTransfer.effectAllowed = 'move';
        }}
        onDragEnd={endDragSession}
      >
        <span>
          {wrestlerIcon(w.lastSeen, showDate)}{' '}
          {w.name.substring(0, 22)}
          {w.name.length > 22 ? '…' : ''}
        </span>
        <span className={css.dragHintSmall} aria-hidden>
          ⋮⋮
        </span>
      </div>
    </li>
  );

  const leftIsEmpty =
    inactiveSection.length === 0 &&
    rosterSection.length === 0 &&
    autresByDivision.every((g) => g.wrestlers.length === 0);

  return (
    <div className={css.page}>
      <div className={css.backRow}>
        <Link href="/" className={css.backLink}>
          ← Retour au calendrier
        </Link>
      </div>

      <header className={css.header}>
        <div className={css.headerTitle}>
          <span className={`show-badge ${show.title}`}>{show.title}</span>
          {show.pleLabel ? (
            <>
              <span className="date-separator">•</span>
              <span className={css.pleLabel}>{show.pleLabel}</span>
            </>
          ) : null}
          <span className="date-separator">•</span>
          <span className="show-date">{formattedDate}</span>
        </div>
        <div className={css.headerActions}>
          <button
            type="button"
            onClick={handleShowSeen}
            className={`seen-btn ${showMarkedAsSeen ? 'marked-as-seen' : ''}`}
            aria-label="Marquer comme vu"
            title="Marquer comme vu"
          >
            {showMarkedAsSeen ? '✓' : '✅'}
          </button>
        </div>
      </header>

      {showMarkedAsSeen && (
        <div className={`confirmation-message ${css.confirmation}`}>
          Show marqué comme terminé avec succès !
        </div>
      )}

      <div className={css.layout}>
        <div className={css.leftPane}>
          {leftIsEmpty && (
            <p className={css.emptyLeft}>
              Aucune superstar à afficher (toutes au show ou déjà match ce jour).
            </p>
          )}

          {inactiveSection.length > 0 && (
            <section className={css.section}>
              <h2 className={css.sectionTitle}>Inactifs</h2>
              <ul className={css.dragList}>{inactiveSection.map(renderDragRow)}</ul>
            </section>
          )}

          {rosterSection.length > 0 && (
            <section className={css.section}>
              <h2 className={css.sectionTitle}>Roster {show.title}</h2>
              <ul className={css.dragList}>{rosterSection.map(renderDragRow)}</ul>
            </section>
          )}

          {autresByDivision.map((group) => (
            <details key={group.name} className={css.details}>
              <summary className={css.summary}>{group.name}</summary>
              <div className={css.detailsBody}>
                <ul className={css.dragList}>{group.wrestlers.map(renderDragRow)}</ul>
              </div>
            </details>
          ))}
        </div>

        <aside className={css.rightPane}>
          <div
            className={`${css.deleteZone} ${deleteDragOver ? css.deleteZoneActive : ''}`}
            onDragOverCapture={onDragOverDeleteCapture}
            onDragLeave={onDragLeaveDelete}
            onDropCapture={onDropDeleteCapture}
          >
            <p className={css.deleteZoneHint}>
              🗑️ Zone supprimer — glissez une superstar depuis la liste à gauche pour la retirer de la base et effacer
              tous ses matchs.
            </p>
          </div>

          <h2 className={css.rightTitle}>Présents / matchs</h2>
          <div
            className={`${css.dropZone} ${dragOver ? css.dropZoneActive : ''}`}
            onDragOverCapture={onDragOverPresentCapture}
            onDragLeave={onDragLeavePresent}
            onDropCapture={onDropPresentCapture}
          >
            <p className={css.dropHint}>
              Glissez des superstars ici pour marquer leur présence sur ce show, puis W ou L pour enregistrer un
              match.
            </p>
            <ul className={css.lineupList}>
              {lineup.map((w) => (
                <li key={w.id} className={css.lineupItem} data-wrestler={w.id}>
                  <Wrestler
                    wrestler={w}
                    show={show}
                    enableContextDelete={false}
                    onAfterMatch={() => handleAfterMatch(w.id)}
                  />
                </li>
              ))}
            </ul>
            {lineup.length === 0 && (
              <p className={css.emptyLeft}>Zone vide — glissez des noms depuis la gauche.</p>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
