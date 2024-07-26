'use client';

import {Wrestler} from "@/components/Wrestler/Wrestler";
import {useState} from "react";

function openModal(e) {
    e.target.nextElementSibling?.classList.add('active')
}

function closeModal() {
    document.querySelector('.modal.active').classList.remove('active');
}

function addWrestler(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const date = e.target.lastSeen.value;
    const showName = e.target.showName.value;
    fetch('/api/add', {
        method: 'POST',
        body: JSON.stringify({
            name: name,
            showName: showName,
            lastSeen: date
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => response.json()).then(data => {
        console.log(data);
        e.target.reset()
    });
}

function showSeen(date){
    fetch('/api/seen-show',{
        method: 'POST',
        body: JSON.stringify({
            date: date
        }),
    })
}

export const Show = ({show, className, allWrestlers}) => {

    const [wrestlers, setWrestlers] = useState(allWrestlers.filter(w => w.matches === 0 || w.match.pop()?.date.toISOString() !== show.date));
    console.log(wrestlers.length)
    if (!wrestlers) return;

    return (
        <>
            <div className={className} onClick={openModal}>
                <h2>{show.title}</h2>
                <p>{new Date(show.date).toLocaleDateString()}</p>
            </div>
            <div className={'modal'}>
                <div className="backdrop" onClick={closeModal}></div>
                <div className="content">
                    <div className="header">
                        <form action="#" onSubmit={addWrestler}>
                            <input type="text" name={"name"} placeholder={"Name"} title={"Name"}/>
                            <input type="hidden" value={show.title === "PLE" ? "Free" : show.title} name={"showName"}/>
                            <input type="hidden" value={show.date} name={"lastSeen"}/>
                            <button>Add</button>
                        </form>
                        <button onClick={() => {
                            showSeen(show.date.substring(0, 10))
                        }}>✅
                        </button>
                    </div>

                    <ul>
                    {wrestlers && wrestlers.map((wrestler,id) => (
                            <li key={wrestler.id} data-wrestler={wrestler.id}>
                                <Wrestler wrestler={wrestler} show={show} key={id}/>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
