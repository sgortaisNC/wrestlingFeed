"use client";

import {useEffect, useState} from "react";
import css from "./Toast.module.scss";

export const Toast = ({text}) => {

    const [active, setActive] = useState(true)
    const [removed, setRemoved] = useState(false);
    useEffect(() => {
        if (!active) return;
        setTimeout(() => {
            setActive(false);
            setTimeout(() => {
                setRemoved(true);
            },1000)
        },5000)
    }, [active]);

    if (removed) return null;
    return (
        <div className={css.toast + (active ? " "+css.active : "")}>
            <p>{text}</p>
        </div>
    )
}