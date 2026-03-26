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

function lastSeenDelta(date1: string | Date | null, date2: string | Date) {
    if (!date1) return Number.POSITIVE_INFINITY;
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffEnMs = d2.getTime() - d1.getTime();
    return diffEnMs / (1000 * 3600 * 24);
}

const wrestlerStyles = {
    container: {
        display: 'flex' as const,
        width: "100%",
        justifyContent: "space-between" as const,
        alignItems: 'center' as const,
        gap: '0.75rem'
    },
    btn: {
        background: 'rgba(255, 255, 255, 0.1)',
        borderTopWidth: '1px',
        borderTopStyle: 'solid' as const,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        borderRightWidth: '1px',
        borderRightStyle: 'solid' as const,
        borderRightColor: 'rgba(255, 255, 255, 0.2)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid' as const,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        borderLeftWidth: '1px',
        borderLeftStyle: 'solid' as const,
        borderLeftColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '12px',
        padding: '0.75rem 1rem',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: '500' as const,
        cursor: 'pointer' as const,
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        position: 'relative' as const,
        overflow: 'hidden' as const,
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        flex: 1,
        textAlign: 'left' as const,
    },
    btnHover: {
        background: 'rgba(255, 255, 255, 0.15)',
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
        borderRightColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 15px rgba(255, 255, 255, 0.1)'
    },
    btnSeen: {
        background: 'rgba(16, 185, 129, 0.3)',
        borderTopColor: 'rgba(16, 185, 129, 0.4)',
        borderRightColor: 'rgba(16, 185, 129, 0.4)',
        borderBottomColor: 'rgba(16, 185, 129, 0.4)',
        color: '#10b981'
    },
    btnSameShow: {
        borderLeftWidth: '3px',
        borderLeftColor: 'rgba(255, 105, 180, 0.6)'
    },
    cta: {
        background: 'rgba(255, 255, 255, 0.1)',
        borderTopWidth: '1px',
        borderTopStyle: 'solid' as const,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
        borderRightWidth: '1px',
        borderRightStyle: 'solid' as const,
        borderRightColor: 'rgba(255, 255, 255, 0.2)',
        borderBottomWidth: '1px',
        borderBottomStyle: 'solid' as const,
        borderBottomColor: 'rgba(255, 255, 255, 0.2)',
        borderLeftWidth: '1px',
        borderLeftStyle: 'solid' as const,
        borderLeftColor: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '8px',
        padding: '0.5rem 0.75rem',
        color: 'white',
        fontSize: '0.8rem',
        fontWeight: '600' as const,
        cursor: 'pointer' as const,
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)',
        minWidth: '32px'
    },
    ctaHover: {
        background: 'rgba(255, 255, 255, 0.2)',
        borderTopColor: 'rgba(255, 255, 255, 0.3)',
        borderRightColor: 'rgba(255, 255, 255, 0.3)',
        borderBottomColor: 'rgba(255, 255, 255, 0.3)',
        borderLeftColor: 'rgba(255, 255, 255, 0.3)',
        transform: 'translateY(-1px)',
        boxShadow: '0 2px 8px rgba(255, 255, 255, 0.1)'
    },
    actionsContainer: {
        display: 'flex' as const,
        gap: '0.5rem'
    }
};

type WrestlerProps = {
  wrestler: {
    id: number;
    name: string;
    lastSeen: string | Date | null;
    showName: string | null;
    match: { date: string | Date }[];
  };
  show: { date: string; title: string; pleLabel?: string };
  onAfterMatch?: () => void;
  /** Clic droit : suppression API (désactivé sur la page show : corbeille par glisser-déposer). */
  enableContextDelete?: boolean;
};

export const Wrestler = ({ wrestler, show, onAfterMatch, enableContextDelete = true }: WrestlerProps) => {

    const [lastSeen, setLastSeen] = useState(wrestler.lastSeen);
    const [toastMessage, setToastMessage] = useState('');
    const [btnHovered, setBtnHovered] = useState(false);
    const [ctaHovered, setCtaHovered] = useState({ win: false, lose: false });
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

    const btnStyle = {
        ...wrestlerStyles.btn,
        ...(btnHovered && wrestlerStyles.btnHover),
        ...(lastSeenDelta(lastSeen, showDate) < 1 && wrestlerStyles.btnSeen),
        ...(wrestler.showName === show.title && wrestlerStyles.btnSameShow)
    };

    return (
        <div style={wrestlerStyles.container}>
            <button
                style={btnStyle}
                data-wrestler={wrestler.id} 
                data-date={showDate}
                data-roster={wrestler.showName}
                onContextMenu={enableContextDelete ? (e) => remove(e) : undefined}
                onClick={present}
                onMouseEnter={() => setBtnHovered(true)}
                onMouseLeave={() => setBtnHovered(false)}
            >
                {icon} {wrestler.name.substring(0, 20)}
            </button>
            <div style={wrestlerStyles.actionsContainer}>
                <button 
                    style={{
                        ...wrestlerStyles.cta,
                        ...(ctaHovered.win && wrestlerStyles.ctaHover),
                        background: ctaHovered.win ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: ctaHovered.win ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                        color: ctaHovered.win ? '#10b981' : 'white'
                    }}
                    onClick={() => {
                        win(wrestler.id, showDate);
                        onAfterMatch?.();
                        document
                            .querySelector(`.modal.active li[data-wrestler="${wrestler.id}"]`)
                            ?.remove();
                    }}
                    onMouseEnter={() => setCtaHovered(prev => ({ ...prev, win: true }))}
                    onMouseLeave={() => setCtaHovered(prev => ({ ...prev, win: false }))}
                > 
                    W
                </button>
                <button 
                    style={{
                        ...wrestlerStyles.cta,
                        ...(ctaHovered.lose && wrestlerStyles.ctaHover),
                        background: ctaHovered.lose ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        borderColor: ctaHovered.lose ? 'rgba(239, 68, 68, 0.3)' : 'rgba(255, 255, 255, 0.2)',
                        color: ctaHovered.lose ? '#ef4444' : 'white'
                    }}
                    onClick={() => {
                        loose(wrestler.id, showDate);
                        onAfterMatch?.();
                        document
                            .querySelector(`.modal.active li[data-wrestler="${wrestler.id}"]`)
                            ?.remove();
                    }}
                    onMouseEnter={() => setCtaHovered(prev => ({ ...prev, lose: true }))}
                    onMouseLeave={() => setCtaHovered(prev => ({ ...prev, lose: false }))}
                > 
                    L
                </button>
            </div>
            {toastMessage !== "" && <Toast text={toastMessage} />}
        </div>
    );
}
