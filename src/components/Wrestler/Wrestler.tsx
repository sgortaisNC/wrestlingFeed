import React, {useState} from "react";
import {Toast} from "@/components/Toast/Toast";

function win(id: number, date: string){
    fetch('/api/match', {
        method: 'POST',
        body: JSON.stringify({
            wrestlerId: id,
            win: true,
            draw: false,
            loose: false,
            date: date
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((data) => {
        console.log('Success:', data);
    })
}
function loose(id: number, date: string){
    fetch('/api/match', {
        method: 'POST',
        body: JSON.stringify({
            wrestlerId: id,
            win: false,
            draw: false,
            loose: true,
            date: date
        }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then((data) => {
        console.log('Success:', data);
    })
}

function lastSeenDelta(date1: string, date2: string) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffEnMs = d2.getTime() - d1.getTime();
    return diffEnMs / (1000 * 3600 * 24);
}

export const Wrestler = ({wrestler, show}) => {

    const [lastSeen, setLastSeen] = useState(wrestler.lastSeen);
    const [toastMessage, setToastMessage] = useState('');
    const showDate = show.date;

    let icon = '👻';
    if (lastSeenDelta(lastSeen, showDate) < 35) icon = '🚑';
    if (lastSeenDelta(lastSeen, showDate) < 14) icon = '😴';
    if (lastSeenDelta(lastSeen, showDate) <= 7) icon = '🔥';

    function present(e: React.MouseEvent<HTMLButtonElement>) {

        const target = e.target as HTMLButtonElement;

        const wrestlerId = target.getAttribute('data-wrestler');
        const date = target.getAttribute('data-date');

        fetch('/api/seen', {
            method: 'PUT',
            body: JSON.stringify({id: wrestlerId, date: date}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(() => {
            target.classList.add('seen');
            setLastSeen(showDate);
            setToastMessage(`${wrestler.name} was here !` )
        })
    }
    function remove(e: React.MouseEvent<HTMLButtonElement>) {
        e.preventDefault();

        const domClickedElement : HTMLElement = e.target as HTMLElement;
        const domParentElement = domClickedElement.parentElement.parentElement;

        fetch('/api/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({id: domClickedElement.dataset.wrestler}),
        })
            .then(response => response.json())
            .then(data => {
                setToastMessage(`${data.wrestler.name} and ${data.nbMatchRemove} matches removed.`)
                setTimeout(() => {
                    domParentElement.remove();
                },6000)
            });
    }

    return (
        <div style={{display: 'flex',width:"100%", justifyContent: "space-between"}}>
            <button
                className={(lastSeenDelta(lastSeen, showDate) < 1 ? 'btn seen' : 'btn') + (wrestler.showName === show.title ? ' sameShow' : '')}
                data-wrestler={wrestler.id} data-date={showDate}
                data-roster={wrestler.showName}
                onContextMenu={(e) => {remove(e)}}
                onClick={present}
            >
                {wrestler.name.substring(0, 20)} {icon}
            </button>
            <div>
                <button onClick={() => {
                    win(wrestler.id,showDate);
                    document.querySelector(`.modal.active li[data-wrestler="${wrestler.id}"]`).remove();
                }} className={"cta"}> W
                </button>
                &nbsp;
                <button onClick={() => {
                    loose(wrestler.id,showDate);
                    document.querySelector(`.modal.active li[data-wrestler="${wrestler.id}"]`).remove();
                }} className={"cta"}> L
                </button>
            </div>
            {toastMessage !== "" && <Toast text={toastMessage} />}
        </div>
    );
}
