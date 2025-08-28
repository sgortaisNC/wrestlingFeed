"use client";

import { useEffect, useState } from "react";
import css from "./Wrestlers.module.scss";

interface Wrestler {
    id: number;
    name: string;
    show: string;
}

const SHOWS = ["Raw", "SmackDown", "NXT", "Evolve"] as const;
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

    useEffect(() => {
        fetchWrestlers();
    }, []);

    const fetchWrestlers = async () => {
        try {
            const response = await fetch('/api/wrestlers');
            const data = await response.json();
            // Normaliser les shows des wrestlers
            const normalizedData = data.map((wrestler: Wrestler) => ({
                ...wrestler,
                show: normalizeShowName(wrestler.show)
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, wrestlerId: number) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const name = formData.get('name') as string;
        const show = formData.get('show') as Show;

        try {
            const response = await fetch(`/api/wrestlers/${wrestlerId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, show }),
            });

            if (response.ok) {
                fetchWrestlers();
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du wrestler:', error);
        }
    };

    if (loading) {
        return <div className={css.loading}>Chargement...</div>;
    }

    return (
        <div className={css.container}>
            <h1>Gestion des Wrestlers</h1>
            <div className={css.wrestlersList}>
                {wrestlers.map((wrestler) => (
                    <form key={wrestler.id} onSubmit={(e) => handleSubmit(e, wrestler.id)} className={css.wrestlerForm}>
                        <div className={css.formGroup}>
                            <label htmlFor={`name-${wrestler.id}`}>Nom:</label>
                            <input
                                type="text"
                                id={`name-${wrestler.id}`}
                                name="name"
                                defaultValue={wrestler.name}
                                required
                                className={css.input}
                            />
                        </div>
                        <div className={css.formGroup}>
                            <label htmlFor={`show-${wrestler.id}`}>Show:</label>
                            <select
                                id={`show-${wrestler.id}`}
                                name="show"
                                value={wrestler.show}
                                onChange={(e) => handleShowChange(wrestler.id, e.target.value as Show)}
                                required
                                className={css.select}
                            >
                                {SHOWS.map((show) => (
                                    <option key={show} value={show}>
                                        {show}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className={css.submitButton}>Mettre à jour</button>
                    </form>
                ))}
            </div>
        </div>
    );
} 