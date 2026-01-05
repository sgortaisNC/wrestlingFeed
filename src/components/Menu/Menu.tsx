"use client";

import Link from "next/link";
import css from './Menu.module.scss';
import { useEffect, useState, useRef } from "react";
import { WrestlerModal } from "@/components/Wrestler/WrestlerModal";
import { usePathname } from "next/navigation";

export const Menu = () => {
    const [matchCount, setMatchCount] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showScrollHint, setShowScrollHint] = useState(false);
    const menuRef = useRef<HTMLUListElement>(null);
    const pathname = usePathname();

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

    // Vérifier si le menu est scrollable sur les petits écrans
    useEffect(() => {
        const checkIfScrollable = () => {
            if (menuRef.current) {
                const isScrollable = menuRef.current.scrollWidth > menuRef.current.clientWidth;
                setShowScrollHint(isScrollable);
            }
        };

        // Vérifier au chargement et au redimensionnement
        checkIfScrollable();
        window.addEventListener('resize', checkIfScrollable);
        
        return () => {
            window.removeEventListener('resize', checkIfScrollable);
        };
    }, []);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Fonction pour déterminer si un lien est actif
    const isActive = (path: string) => {
        return pathname === path;
    };

    return (
        <>
            <nav className={css.menu}>
                <ul ref={menuRef} className={showScrollHint ? css.scrollable : ''}>
                    <li>
                        <Link href={"/"} className={isActive('/') ? css.activeLink : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                            Home
                        </Link>
                    </li>
                    <li>
                        <Link href={"/tier"} className={isActive('/tier') ? css.activeLink : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="8" y1="6" x2="21" y2="6"></line>
                                <line x1="8" y1="12" x2="21" y2="12"></line>
                                <line x1="8" y1="18" x2="21" y2="18"></line>
                                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                                <line x1="3" y1="18" x2="3.01" y2="18"></line>
                            </svg>
                            Tier list
                        </Link>
                    </li>
                    <li>
                        <Link href={"/correction"} className={isActive('/correction') ? css.activeLink : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9"></path>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                            </svg>
                            Correction {matchCount !== null && `(${matchCount})`}
                        </Link>
                    </li>
                    <li>
                        <Link href={"/wrestlers"} className={isActive('/wrestlers') ? css.activeLink : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                <circle cx="9" cy="7" r="4"></circle>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                            </svg>
                            Wrestlers
                        </Link>
                    </li>
                    <li>
                        <Link href={"/news"} className={isActive('/news') ? css.activeLink : ''}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path>
                                <path d="M18 14h-8"></path>
                                <path d="M15 18h-5"></path>
                                <path d="M10 6h8v4h-8V6z"></path>
                            </svg>
                            News WWE
                        </Link>
                    </li>
                    <li>
                        <a href="#" onClick={openModal}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="16"></line>
                                <line x1="8" y1="12" x2="16" y2="12"></line>
                            </svg>
                            Ajouter
                        </a>
                    </li>
                </ul>
            </nav>
            <WrestlerModal isOpen={isModalOpen} onClose={closeModal} />
        </>
    );
}