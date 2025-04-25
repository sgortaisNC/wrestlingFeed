import {TL} from '@/utils/types';
import css from "./style.module.scss";
import { log } from 'console';

export const dynamic = "force-dynamic";

export default async function TierList() {

    const base_url = process.env.BASE_URL;
    console.log(base_url+'api/tier');
    let tierList: TL = await fetch(base_url+'api/tier',{ next: { revalidate: 120 } }).then((res) => res.json());
    
    return (
        <>
            <div className={css.grid}>
                <div className={css.line}>
                    <div className={css.letter + " " + css.ss}>
                        S+
                    </div>
                    <div className={css.liste}>
                        <div className={css.male}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "S+" && w.gender === "male").map((w, index) => {
                                    return (
                                        <li key={index} className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className={css.female}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "S+" && w.gender === "female").map((w, index) => {
                                    return (
                                        <li key={index} className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter + " " + css.s}>
                        S
                    </div>
                    <div className={css.liste}>
                        <div className={css.male}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "S" && w.gender === "male").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className={css.female}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "S" && w.gender === "female").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter + " " + css.a}>
                        A
                    </div>
                    <div className={css.liste}>
                        <div className={css.male}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "A" && w.gender === "male").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className={css.female}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "A" && w.gender === "female").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter + " " + css.b}>
                        B
                    </div>
                    <div className={css.liste}>
                        <div className={css.male}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "B" && w.gender === "male").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className={css.female}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "B" && w.gender === "female").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter + " " + css.c} >
                        C
                    </div>
                    <div className={css.liste}>
                        <div className={css.male}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "C" && w.gender === "male").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className={css.female}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "C" && w.gender === "female").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter + " " + css.d}>
                        D
                    </div>
                    <div className={css.liste}>
                        <div className={css.male}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "D" && w.gender === "male").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                        <div className={css.female}>
                            <ul>
                                {tierList.tier.filter(w => w.tier === "D" && w.gender === "female").map((w, index) => {
                                    return (
                                        <li key={index}
                                            className={w.isActive ? css.active + " " + (w.lastResult === "Win" ? css.win : css.loss) : ""}>
                                            {w.name} {w.matches === tierList.maxMatches ? "🥇"  : ""}
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
