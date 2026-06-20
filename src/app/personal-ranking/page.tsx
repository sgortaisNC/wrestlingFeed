"use client";

import { useCallback, useEffect, useState } from "react";
import css from "./PersonalRanking.module.scss";

interface Wrestler {
    id: number;
    name: string;
    gender: string;
    showName: string | null;
    personalScore: number | null;
    personalVotes: number;
}

interface RankingState {
    ranking: Wrestler[];
    pair: [Wrestler, Wrestler] | null;
    totalWrestlers: number;
    totalDuels: number;
    lastChanged?: number[];
}

const SHOW_COLORS: Record<string, string> = {
    Raw: "#e53935",
    SmackDown: "#1565c0",
    NXT: "#6a1b9a",
};

const MEDALS = ["🥇", "🥈", "🥉"];

export default function PersonalRankingPage() {
    const [ranking, setRanking] = useState<Wrestler[]>([]);
    const [pair, setPair] = useState<[Wrestler, Wrestler] | null>(null);
    const [totalDuels, setTotalDuels] = useState(0);
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [chosenId, setChosenId] = useState<number | null>(null);
    const [lastChanged, setLastChanged] = useState<number[]>([]);
    const [error, setError] = useState(false);

    const applyState = (data: RankingState) => {
        setRanking(data.ranking);
        setPair(data.pair);
        setTotalDuels(data.totalDuels);
        setLastChanged(data.lastChanged ?? []);
    };

    const fetchState = useCallback(async () => {
        try {
            const res = await fetch("/api/personal-ranking", { cache: "no-store" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            applyState(await res.json());
        } catch (err) {
            console.error("Erreur chargement classement:", err);
            setError(true);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchState();
    }, [fetchState]);

    const handleChoice = async (winner: Wrestler, loser: Wrestler) => {
        if (voting) return;
        setVoting(true);
        setError(false);
        setChosenId(winner.id);
        try {
            const res = await fetch("/api/personal-ranking", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ winnerId: winner.id, loserId: loser.id }),
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            // Petit délai pour laisser respirer l'animation du choix.
            await new Promise((r) => setTimeout(r, 220));
            applyState(await res.json());
        } catch (err) {
            console.error("Erreur enregistrement du duel:", err);
            setError(true);
        } finally {
            setChosenId(null);
            setVoting(false);
        }
    };

    const handleSkip = () => {
        if (voting) return;
        // Recharge simplement une nouvelle paire sans enregistrer de résultat.
        fetchState();
    };

    const handleReset = async () => {
        if (voting) return;
        if (!confirm("Réinitialiser tout le classement ? Tous les duels seront effacés.")) return;
        setVoting(true);
        try {
            const res = await fetch("/api/personal-ranking", { method: "DELETE" });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            applyState(await res.json());
        } catch (err) {
            console.error("Erreur réinitialisation:", err);
            setError(true);
        } finally {
            setVoting(false);
        }
    };

    // Raccourcis clavier : ← pour le catcheur de gauche, → pour celui de droite.
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (!pair || voting) return;
            if (e.key === "ArrowLeft") handleChoice(pair[0], pair[1]);
            if (e.key === "ArrowRight") handleChoice(pair[1], pair[0]);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pair, voting]);

    if (loading) {
        return (
            <div className={css.container}>
                <div className={css.loading}>Chargement...</div>
            </div>
        );
    }

    const renderWrestlerCard = (w: Wrestler, opponent: Wrestler) => {
        const showColor = w.showName ? SHOW_COLORS[w.showName] : undefined;
        const isChosen = chosenId === w.id;
        const isDimmed = chosenId !== null && chosenId !== w.id;
        return (
            <button
                type="button"
                className={`${css.duelCard} ${isChosen ? css.chosen : ""} ${isDimmed ? css.dimmed : ""}`}
                onClick={() => handleChoice(w, opponent)}
                disabled={voting}
            >
                <span className={css.duelName}>{w.name}</span>
                {w.showName && (
                    <span
                        className={css.showBadge}
                        style={{
                            background: showColor ? `${showColor}33` : undefined,
                            borderColor: showColor ?? undefined,
                        }}
                    >
                        {w.showName}
                    </span>
                )}
                {w.personalScore != null && (
                    <span className={css.duelScore}>{w.personalScore} pts</span>
                )}
            </button>
        );
    };

    return (
        <div className={css.container}>
            <header className={css.header}>
                <h1>Mon Classement</h1>
                <p className={css.subtitle}>
                    Choisis ton préféré à chaque duel — le classement se construit tout seul.
                </p>
                {error && <span className={css.errorBadge}>Une erreur est survenue</span>}
            </header>

            <div className={css.layout}>
                {/* Colonne gauche : le duel */}
                <section className={css.duelColumn}>
                    {pair ? (
                        <div className={css.duel} key={`${pair[0].id}-${pair[1].id}`}>
                            <h2 className={css.duelTitle}>Qui préfères-tu&nbsp;?</h2>
                            <div className={css.duelArena}>
                                {renderWrestlerCard(pair[0], pair[1])}
                                <span className={css.vs}>VS</span>
                                {renderWrestlerCard(pair[1], pair[0])}
                            </div>
                            <div className={css.duelActions}>
                                <button
                                    type="button"
                                    className={css.skipBtn}
                                    onClick={handleSkip}
                                    disabled={voting}
                                >
                                    Passer ce duel
                                </button>
                                <span className={css.duelHint}>
                                    Astuce&nbsp;: utilise les flèches ← →
                                </span>
                            </div>
                            <p className={css.duelCount}>{totalDuels} duels joués</p>
                        </div>
                    ) : (
                        <div className={css.duel}>
                            <p className={css.emptyDuel}>Pas assez de catcheurs pour lancer un duel.</p>
                        </div>
                    )}
                </section>

                {/* Colonne droite : le classement */}
                <section className={css.rankColumn}>
                    <div className={css.rankHeader}>
                        <h2>Ton classement</h2>
                        {ranking.length > 0 && (
                            <button
                                type="button"
                                className={css.resetBtn}
                                onClick={handleReset}
                                disabled={voting}
                            >
                                Réinitialiser
                            </button>
                        )}
                    </div>

                    {ranking.length === 0 ? (
                        <div className={css.emptyRank}>
                            <span className={css.emptyIcon}>🏆</span>
                            <p>Ton classement est vide.</p>
                            <p className={css.emptyHint}>
                                Réponds aux duels à gauche pour le construire.
                            </p>
                        </div>
                    ) : (
                        <ol className={css.list}>
                            {ranking.map((w, index) => {
                                const showColor = w.showName ? SHOW_COLORS[w.showName] : undefined;
                                const bumped = lastChanged.includes(w.id);
                                return (
                                    <li
                                        key={w.id}
                                        className={`${css.item} ${bumped ? css.bump : ""}`}
                                    >
                                        <span className={css.rank}>
                                            {index < 3 ? MEDALS[index] : index + 1}
                                        </span>
                                        <span className={css.name}>{w.name}</span>
                                        {w.showName && (
                                            <span
                                                className={css.showBadge}
                                                style={{
                                                    background: showColor ? `${showColor}33` : undefined,
                                                    borderColor: showColor ?? undefined,
                                                }}
                                            >
                                                {w.showName}
                                            </span>
                                        )}
                                        <span className={css.score}>{w.personalScore}</span>
                                    </li>
                                );
                            })}
                        </ol>
                    )}
                </section>
            </div>
        </div>
    );
}
