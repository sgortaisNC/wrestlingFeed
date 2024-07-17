"use client";

import {useEffect, useState} from "react";

export default function DomElements() {

    const [nbDOM, setNbDOM] = useState(0);

    useEffect(() => {
        setInterval(() => {
            setNbDOM(document.querySelectorAll('*').length);
        },2000)
    }, []);

    return (
        <>
            <div style={{
                position: 'fixed',
                bottom: 0,
                right: 0,
                zIndex: 9999,
                backgroundColor: 'rgba(0,0,0,0.5)',
                padding: '5px 10px',
            }}>
                {nbDOM} DOMElements
            </div>
        </>
    )
}
