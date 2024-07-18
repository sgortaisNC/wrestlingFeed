import {useEffect, useState} from "react";

function remove(e) {
    e.preventDefault();
    fetch('/api/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: e.target.dataset.wrestler}),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            e.target.parentNode.remove();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function win(id, date){
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
function loose(id, date){
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

function lastSeenDelta(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffEnMs = d2.getTime() - d1.getTime();
    return diffEnMs / (1000 * 3600 * 24);
}

export const Wrestler = ({wrestler, show}) => {

    const [lastSeen, setLastSeen] = useState(wrestler.lastSeen);
    const showDate = show.date;

    let icon = '👻';
    if (lastSeenDelta(lastSeen, showDate) < 60) icon = '🚑';
    if (lastSeenDelta(lastSeen, showDate) < 30) icon = '😴';
    if (lastSeenDelta(lastSeen, showDate) <= 7) icon = '🔥';

    function present(e) {
        const wrestlerId = e.target.getAttribute('data-wrestler');
        const date = e.target.getAttribute('data-date');

        fetch('/api/seen', {
            method: 'PUT',
            body: JSON.stringify({id: wrestlerId, date: date}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => response.json()).then(data => {
            e.target.classList.add('seen');
            setLastSeen(showDate);
        })
    }

    return (
        <div style={{display: 'flex',width:"100%", justifyContent: "space-between"}}>
            <button
                className={(lastSeenDelta(lastSeen, showDate) < 1 ? 'btn seen' : 'btn') + (wrestler.showName === show.title ? ' sameShow' : '')}
                data-wrestler={wrestler.id} data-date={showDate}
                data-roster={wrestler.showName}
                onContextMenu={remove}
                onClick={present}
            >
                {wrestler.name.substring(0, 20)} {icon}
            </button>
            <div>
                <button onClick={(e) => {
                    win(wrestler.id,showDate);
                    document.querySelector(`.modal.active li[data-wrestler="${wrestler.id}"]`).remove();
                }} className={"cta"}> Win
                </button>
                &nbsp;
                <button onClick={(e) => {
                    loose(wrestler.id,showDate);
                    document.querySelector(`.modal.active li[data-wrestler="${wrestler.id}"]`).remove();
                }} className={"cta"}> Loose
                </button>
            </div>
        </div>
    );
}
