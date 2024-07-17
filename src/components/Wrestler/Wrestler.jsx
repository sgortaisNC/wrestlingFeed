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


function lastSeenDelta(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffEnMs = d2.getTime() - d1.getTime();
    return diffEnMs / (1000 * 3600 * 24);
}
export const Wrestler = ({wrestler, show}) => {

    const [lastSeen, setLastSeen] = useState(wrestler.lastSeen);
    const [showDate, setShowDate] = useState(show.date);
    const [hoveredWrestler, setHoveredWrestler] = useState('');

    const [matches, setMatches] = useState(wrestler.match);

    const matchLength = matches.length;
    const winLength = matches.filter(match => match.win).length;
    const drawLength = matches.filter(match => match.draw).length;
    const looseLength = matches.filter(match => match.loose).length;

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
    function onHover(e) {
        setHoveredWrestler(e.target.dataset.wrestler);
    }

    function onHoverLeave(e) {
        setHoveredWrestler(null);
    }



    useEffect(() => {
        window.onkeydown = (e) => {
            if (!hoveredWrestler || hoveredWrestler === '')
                return;
            if (!(e.key === 'w' || e.key === 'd' || e.key === 'l')) return;

            fetch('/api/match', {
                method: 'POST',
                body: JSON.stringify({
                    wrestlerId: hoveredWrestler,
                    win: e.key === 'w',
                    draw: e.key === 'd',
                    loose: e.key === 'l',
                    date: showDate
                }),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(r => r.json()).then(data => {
                setMatches([...matches, data]);
                alert(wrestler.name + "  " + e.key);
                document.querySelector(`.modal.active button[data-wrestler="${hoveredWrestler}"]`).parentNode.remove();
            });
        };
    }, [hoveredWrestler, matches, showDate]);

    return (
        <>
            <button
                className={(lastSeenDelta(lastSeen, showDate) < 1 ? 'btn seen' : 'btn') + (wrestler.showName === show.title ? ' sameShow' : '')}
                data-wrestler={wrestler.id} data-date={showDate}
                data-roster={wrestler.showName}
                onContextMenu={remove}
                onMouseEnter={onHover}
                onMouseLeave={onHoverLeave}
                onClick={present}
            >
                {winLength}/{drawLength}/{looseLength} {wrestler.name.substring(0, 20)} {icon}
            </button>
        </>
    );
}
