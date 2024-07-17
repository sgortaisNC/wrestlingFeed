import css from "./style.module.scss";
import {prisma} from "@/Utils/prisma";

export default async function TierList() {

    let wrestlers = await prisma.wrestler.findMany({
        where: {
            active: true
        },
        include: {
            match: true,
        },
    });

    let allMatches = 0;
    wrestlers.map((w) => {allMatches += w.match.length});

    let avgMatches = allMatches / wrestlers.length;
    wrestlers = wrestlers.filter((w) => {
        return w.match.length > avgMatches
    })

    wrestlers.map(w => {
        w.wins = w.match.filter(match => {
            return match.win
        }).length;
        w.draws = w.match.filter(match => {
            return match.draw
        }).length
        w.looses = w.match.filter(match => {
            return match.loose
        }).length
        w.winrate = (100 * w.wins / (w.draws + w.looses + w.wins));
    })

    wrestlers.sort((w1, w2) => {
        if (w1.winrate < w2.winrate) return 1;
        if (w1.winrate > w2.winrate) return -1;
        if (w1.wins < w2.wins) return 1;
        if (w1.wins > w2.wins) return -1;
        if (w1.looses > w2.looses) return 1;
        if (w1.looses < w2.looses) return -1;
    });

    let splus = wrestlers.filter(w => {
        return w.winrate === 100
    });
    let s = wrestlers.filter(w => {
        return w.winrate < 100 && w.winrate >= 75
    });
    let a = wrestlers.filter(w => {
        return w.winrate < 75 && w.winrate > 50
    });
    let b = wrestlers.filter(w => {
        return w.winrate <= 50 && w.winrate > 25
    });
    let c = wrestlers.filter(w => {
        return w.winrate <= 25 && w.winrate > 0
    });
    let d = wrestlers.filter(w => {
        return w.winrate === 0
    });

    return (
        <>
            <div className={css.grid}>
                <div className={css.infos}>
                    Moyenne de match  : {avgMatches.toFixed(2)}
                </div>
                <div className={css.line}>
                    <div className={css.letter} style={{"--color": "#287cb0"}}>
                        S+ <br/> <small>100%</small>
                    </div>
                    <div className={css.liste}>
                        <ul>
                            {splus.map((w, index) => {
                                return (
                                    <li key={index}>
                                        {w.name}
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter} style={{"--color": "#15adb2"}}>
                        S <small> {">= 75%"} </small>
                    </div>
                    <div className={css.liste}>
                        <ul>
                            {s.map((w, index) => {
                                return (
                                    <li key={index}>{w.name}</li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter} style={{"--color": "#3abb3c"}}>
                        A
                        <small> {"> 50%"} </small>
                    </div>
                    <div className={css.liste}>
                        <ul>
                            {a.map((w, index) => {
                                return (
                                    <li key={index}>{w.name}</li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter} style={{"--color": "#bbb53a"}}>
                        B <small> {">= 25%"} </small>
                    </div>
                    <div className={css.liste}>
                        <ul>
                            {b.map((w, index) => {
                                return (
                                    <li key={index}>{w.name}</li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter} style={{"--color": "#da8345"}}>
                        C <small> {" > 0%"} </small>
                    </div>
                    <div className={css.liste}>
                        <ul>
                            {c.map((w, index) => {
                                return (
                                    <li key={index}>{w.name}</li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
                <div className={css.line}>
                    <div className={css.letter} style={{"--color": "#F00"}}>
                        D <small> {"0%"} </small>
                    </div>
                    <div className={css.liste}>
                        <ul>
                            {d.map((w, index) => {
                                return (
                                    <li key={index}>{w.name}</li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        </>
    )
}
