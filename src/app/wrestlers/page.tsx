"use client";

import { useEffect, useState } from "react";
import css from "./Wrestlers.module.scss";

interface Wrestler {
    id: number;
    name: string;
    show: Show;
}

interface ApiWrestler {
    id: number;
    name: string;
    show?: string | { name?: string | null } | null;
    showName?: string | null;
}

const SHOWS = ["Raw", "SmackDown", "NXT"] as const;
type Show = typeof SHOWS[number];

const normalizeShowName = (show: string | null | undefined): Show => {
    // Si show est undefined ou null, retourner la valeur par défaut
    if (!show) return "Raw";
    
    // Normaliser les noms des shows pour gérer les différentes écritures possibles
    const normalized = show.toLowerCase().trim();
    if (normalized.includes("raw")) return "Raw";
    if (normalized.includes("smackdown") || normalized.includes("smack down")) return "SmackDown";
    if (normalized.includes("nxt")) return "NXT";
    return "Raw"; // Valeur par défaut
};

export default function WrestlersPage() {
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggedWrestlerId, setDraggedWrestlerId] = useState<number | null>(null);
    const [savingIds, setSavingIds] = useState<number[]>([]);

    useEffect(() => {
        fetchWrestlers();
    }, []);

    const fetchWrestlers = async () => {
        try {
            const response = await fetch('/api/wrestlers');
            const data = await response.json();
            // Normaliser les shows des wrestlers
            const normalizedData = (data as ApiWrestler[]).map((wrestler) => ({
                ...wrestler,
                show: normalizeShowName(
                    typeof wrestler.show === "string"
                        ? wrestler.show
                        : wrestler.show?.name ?? wrestler.showName
                )
            }));
            setWrestlers(normalizedData);
        } catch (error) {
            console.error('Erreur lors de la récupération des wrestlers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleShowChange = (wrestlerId: number, newShow: Show) => {
        setWrestlers(prevWrestlers => 
            prevWrestlers.map(wrestler => 
                wrestler.id === wrestlerId 
                    ? { ...wrestler, show: newShow }
                    : wrestler
            )
        );
    };

    const updateWrestler = async (wrestlerId: number, payload: Pick<Wrestler, "name" | "show">) => {
        setSavingIds((prev) => [...prev, wrestlerId]);
        try {
            const response = await fetch(`/api/wrestlers/${wrestlerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error("Impossible de mettre a jour le wrestler.");
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du wrestler:', error);
            throw error;
        } finally {
            setSavingIds((prev) => prev.filter((id) => id !== wrestlerId));
        }
    };

    const handleDrop = async (targetShow: Show) => {
        if (draggedWrestlerId === null) return;

        const wrestler = wrestlers.find((item) => item.id === draggedWrestlerId);
        if (!wrestler) return;

        if (wrestler.show === targetShow) {
            setDraggedWrestlerId(null);
            return;
        }

        const previousShow = wrestler.show;
        handleShowChange(draggedWrestlerId, targetShow);

        try {
            await updateWrestler(draggedWrestlerId, {
                name: wrestler.name,
                show: targetShow,
            });
        } catch {
            handleShowChange(draggedWrestlerId, previousShow);
        } finally {
            setDraggedWrestlerId(null);
        }
    };

    const handleSave = async (wrestlerId: number) => {
        const wrestler = wrestlers.find((item) => item.id === wrestlerId);
        if (!wrestler) return;

        try {
            await updateWrestler(wrestlerId, { name: wrestler.name, show: wrestler.show });
        } catch {
            // L'erreur est deja loggee dans updateWrestler.
        }
    };

    if (loading) {
        return <div className={css.loading}>Chargement...</div>;
    }

    return (
        <div className={css.container}>
            <h1>Gestion des Wrestlers</h1>
            <p className={css.subtitle}>Glisser-deposer les wrestlers d&apos;une colonne a l&apos;autre pour changer de show.</p>
            <div className={css.board}>
                {SHOWS.map((show) => (
                    <section
                        key={show}
                        className={`${css.column} ${draggedWrestlerId !== null ? css.columnDroppable : ""}`}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => handleDrop(show)}
                    >
                        <header className={css.columnHeader}>
                            <h2>{show}</h2>
                            <span>{wrestlers.filter((wrestler) => wrestler.show === show).length}</span>
                        </header>
                        <div className={css.cards}>
                            {wrestlers
                                .filter((wrestler) => wrestler.show === show)
                                .map((wrestler) => {
                                    const isSaving = savingIds.includes(wrestler.id);

                                    return (
                                        <article
                                            key={wrestler.id}
                                            className={css.card}
                                            draggable
                                            onDragStart={() => setDraggedWrestlerId(wrestler.id)}
                                            onDragEnd={() => setDraggedWrestlerId(null)}
                                        >
                                            <div className={css.cardHeader}>
                                                <span className={css.showBadge}>{wrestler.show}</span>
                                                {isSaving && <span className={css.saving}>Sauvegarde...</span>}
                                            </div>
                                            <div className={css.formGroup}>
                                                <label htmlFor={`name-${wrestler.id}`}>Nom</label>
                                                <input
                                                    type="text"
                                                    id={`name-${wrestler.id}`}
                                                    name="name"
                                                    value={wrestler.name}
                                                    required
                                                    className={css.input}
                                                    onChange={(event) => {
                                                        const newName = event.target.value;
                                                        setWrestlers((prev) =>
                                                            prev.map((item) =>
                                                                item.id === wrestler.id ? { ...item, name: newName } : item
                                                            )
                                                        );
                                                    }}
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                className={css.submitButton}
                                                onClick={() => handleSave(wrestler.id)}
                                                disabled={isSaving}
                                            >
                                                Sauvegarder
                                            </button>
                                        </article>
                                    );
                                })}
                        </div>
                    </section>
                ))}
            </div>
        </div>
    );
} 