"use client";

import { useEffect, useRef, useState } from "react";
import css from "./PersonalRanking.module.scss";

interface Wrestler {
    id: number;
    name: string;
    gender: string;
    showName: string | null;
    personalRank: number | null;
}

const SHOW_COLORS: Record<string, string> = {
    Raw: "#e53935",
    SmackDown: "#1565c0",
    NXT: "#6a1b9a",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function PersonalRankingPage() {
    const [wrestlers, setWrestlers] = useState<Wrestler[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState(false);
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
    const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        fetchRanking();
    }, []);

    const fetchRanking = async () => {
        try {
            const res = await fetch("/api/personal-ranking", { cache: "no-store" });
            const data: Wrestler[] = await res.json();
            setWrestlers(data);
        } catch (err) {
            console.error("Erreur chargement classement:", err);
        } finally {
            setLoading(false);
        }
    };

    const saveRanking = (ordered: Wrestler[]) => {
        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(async () => {
            setSaving(true);
            setSaveError(false);
            try {
                const rankings = ordered.map((w, i) => ({ id: w.id, rank: i + 1 }));
                const res = await fetch("/api/personal-ranking", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ rankings }),
                });
                if (!res.ok) {
                    throw new Error(`Sauvegarde échouée (${res.status})`);
                }
            } catch (err) {
                console.error("Erreur sauvegarde:", err);
                setSaveError(true);
            } finally {
                setSaving(false);
            }
        }, 600);
    };

    const handleDragStart = (index: number) => {
        setDragIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDrop = (targetIndex: number) => {
        if (dragIndex === null || dragIndex === targetIndex) {
            setDragIndex(null);
            setDragOverIndex(null);
            return;
        }

        const reordered = [...wrestlers];
        const [moved] = reordered.splice(dragIndex, 1);
        reordered.splice(targetIndex, 0, moved);

        setWrestlers(reordered);
        setDragIndex(null);
        setDragOverIndex(null);
        saveRanking(reordered);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    if (loading) {
        return (
            <div className={css.container}>
                <div className={css.loading}>Chargement...</div>
            </div>
        );
    }

    return (
        <div className={css.container}>
            <header className={css.header}>
                <h1>Mon Classement</h1>
                <p className={css.subtitle}>
                    Glisse-dépose les catcheurs pour les ordonner selon ton plaisir de les regarder.
                </p>
                {saving && <span className={css.savingBadge}>Sauvegarde...</span>}
                {!saving && saveError && (
                    <span className={css.savingBadge} style={{ background: "#e5393533", borderColor: "#e53935", color: "#e53935" }}>
                        Échec de la sauvegarde
                    </span>
                )}
            </header>

            <ol className={css.list}>
                {wrestlers.map((wrestler, index) => {
                    const isDragging = dragIndex === index;
                    const isOver = dragOverIndex === index && dragIndex !== index;
                    const showColor = wrestler.showName ? SHOW_COLORS[wrestler.showName] : undefined;

                    return (
                        <li
                            key={wrestler.id}
                            className={`${css.item} ${isDragging ? css.dragging : ""} ${isOver ? css.over : ""}`}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDrop={() => handleDrop(index)}
                            onDragEnd={handleDragEnd}
                        >
                            <span className={css.rank}>
                                {index < 3 ? MEDALS[index] : index + 1}
                            </span>
                            <span className={css.name}>{wrestler.name}</span>
                            {wrestler.showName && (
                                <span
                                    className={css.showBadge}
                                    style={{ background: showColor ? `${showColor}33` : undefined, borderColor: showColor ?? undefined }}
                                >
                                    {wrestler.showName}
                                </span>
                            )}
                            <span className={css.handle}>⠿</span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
