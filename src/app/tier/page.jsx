import css from "./style.module.scss";

export const dynamic = "force-dynamic";
export default async function TierList() {

    const base_url = process.env.BASE_URL;

    let tierList = await fetch(base_url+'api/tier',{ next: { revalidate: 120 } }).then((res) => res.json());


    return (
        <>
            <div className={css.grid}>
                <div className={css.infos}>
                    Moyenne de match  : {tierList.avg.toFixed(2)}
                </div>
                <div className={css.line}>
                    <div className={css.letter} style={{"--color": "#287cb0"}}>
                        S+ <br/> <small>100%</small>
                    </div>
                    <div className={css.liste}>
                        <ul>
                            {tierList.tier.filter(w => w.tier === "S+").map((w, index) => {
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
                            {tierList.tier.filter(w => w.tier === "S").map((w, index) => {
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
                            {tierList.tier.filter(w => w.tier === "A").map((w, index) => {
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
                            {tierList.tier.filter(w => w.tier === "B").map((w, index) => {
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
                            {tierList.tier.filter(w => w.tier === "C").map((w, index) => {
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
                            {tierList.tier.filter(w => w.tier === "D").map((w, index) => {
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
