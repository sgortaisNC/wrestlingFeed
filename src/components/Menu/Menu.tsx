"use client";

import Link from "next/link";
import css from './Menu.module.scss';

export const Menu = () => {
    return (
        <>
            <nav className={css.menu}>
                <ul>
                    <li><Link href={"/"}>Home</Link></li>
                    <li><Link href={"/tier"}>Tier list</Link></li>
                </ul>
            </nav>
        </>
    )
}