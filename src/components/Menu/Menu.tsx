"use client";

import Link from "next/link";
import css from './Menu.module.scss';
import { useEffect, useState } from "react";

export const Menu = () => {
    const [matchCount, setMatchCount] = useState<number | null>(null);

    useEffect(() => {
        const fetchMatchCount = async () => {
            try {
                const response = await fetch('/api/matches/count');
                const data = await response.json();
                setMatchCount(data.count);
            } catch (error) {
                console.error('Erreur lors de la récupération du nombre de matches:', error);
            }
        };

        fetchMatchCount();
    }, []);

    return (
        <>
            <nav className={css.menu}>
                <ul>
                    <li><Link href={"/"}>Home</Link></li>
                    <li><Link href={"/tier"}>Tier list</Link></li>
                    <li>
                        <Link href={"/correction"}>
                            Correction des matches {matchCount !== null && `(${matchCount})`}
                        </Link>
                    </li>
                </ul>
            </nav>
        </>
    )
}