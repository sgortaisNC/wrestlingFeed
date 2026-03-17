'use client';

import {Wrestler} from "@/components/Wrestler/Wrestler";
import {useState} from "react";

function openModal(e) {
    e.target.nextElementSibling?.classList.add('active')
}

function closeModal() {
    document.querySelector('.modal.active')?.classList.remove('active');
}

function addWrestler(e) {
    e.preventDefault();
    const name = e.target.name.value;
    const date = e.target.lastSeen.value;
    const showName = e.target.showName.value;
    const gender = e.target.gender.value;
    fetch('/api/add', {
        method: 'POST',
        body: JSON.stringify({
            name: name,
            showName: showName,
            lastSeen: date,
            gender: gender
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

function lastSeenDelta(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return (d2.getTime() - d1.getTime()) / (1000 * 3600 * 24);
}

function isInactive(wrestler, showDate) {
    if (!wrestler.lastSeen) return true;
    return lastSeenDelta(wrestler.lastSeen, showDate) >= 35;
}

export const Show = ({show, className}) => {

    const [wrestlers, setWrestlers] = useState(show.wrestlers);
    const [showMarkedAsSeen, setShowMarkedAsSeen] = useState(false);
    const [showAllWrestlers, setShowAllWrestlers] = useState(false);
    const [showInactiveWrestlers, setShowInactiveWrestlers] = useState(false);
    
    if (!wrestlers) return;

    const filteredWrestlers = wrestlers.filter((wrestler) => {
        const lastMatch = wrestler.match.find((match) => match.date.toLocaleDateString() === new Date(show.date).toLocaleDateString());
        return lastMatch === undefined;
    });

    const linkedWrestlers = filteredWrestlers.filter((w) => w.showName === show.title);
    const sourceWrestlers = showAllWrestlers ? filteredWrestlers : linkedWrestlers;
    const inactiveInSource = sourceWrestlers.filter((w) => isInactive(w, show.date));
    const displayedWrestlers = showInactiveWrestlers
        ? sourceWrestlers
        : sourceWrestlers.filter((w) => !isInactive(w, show.date));
    
    const handleShowSeen = () => {
        showSeen(show.date.substring(0, 10));
        setShowMarkedAsSeen(true);
        
        // Réinitialiser l'état après 2 secondes
        setTimeout(() => {
            setShowMarkedAsSeen(false);
        }, 2000);
    };
    
    const formattedDate = new Date(show.date).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });

    return (
        <>
            <div className={className} onClick={openModal}>
                <h2>{show.title}</h2>
                <p>{formattedDate}</p>
            </div>
            <div className={'modal'}>
                <div className="backdrop" onClick={closeModal}></div>
                <div className="content">
                    <div className="header">
                        <h3>
                            <span className={`show-badge ${show.title}`}>{show.title}</span>
                            <span className="date-separator">•</span>
                            <span className="show-date">{formattedDate}</span>
                            {filteredWrestlers.length > linkedWrestlers.length && (
                                <button
                                    type="button"
                                    onClick={() => setShowAllWrestlers(!showAllWrestlers)}
                                    className={`show-all-btn ${showAllWrestlers ? 'active' : ''}`}
                                    title={showAllWrestlers ? "Afficher uniquement les superstars du roster" : "Afficher toutes les superstars (présence inhabituelle)"}
                                    aria-label={showAllWrestlers ? "Afficher uniquement le roster" : "Afficher toutes les superstars"}
                                >
                                    {showAllWrestlers ? "Roster uniquement" : "Toutes"}
                                </button>
                            )}
                            {inactiveInSource.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowInactiveWrestlers(!showInactiveWrestlers)}
                                    className={`show-inactive-btn ${showInactiveWrestlers ? 'active' : ''}`}
                                    title={showInactiveWrestlers ? "Masquer les superstars inactives (👻)" : "Afficher les superstars inactives (👻)"}
                                    aria-label={showInactiveWrestlers ? "Masquer les inactives" : "Afficher les inactives"}
                                >
                                    👻 {showInactiveWrestlers ? "Masquer" : "Inactifs"}
                                </button>
                            )}
                        </h3>
                        <div className="header-actions">
                            <button 
                                onClick={handleShowSeen}
                                className={`seen-btn ${showMarkedAsSeen ? 'marked-as-seen' : ''}`}
                                aria-label="Marquer comme vu"
                                title="Marquer comme vu"
                            >
                                {showMarkedAsSeen ? '✓' : '✅'}
                            </button>
                        </div>
                    </div>
                    
                    {/* Message de confirmation */}
                    {showMarkedAsSeen && (
                        <div className="confirmation-message">
                            Show marqué comme terminé avec succès!
                        </div>
                    )}
                    
                    <div className="modal-content-body">
                        <ul>
                        {displayedWrestlers && displayedWrestlers.map((wrestler,id) => (
                                <li key={id} data-wrestler={wrestler.id}>
                                    <Wrestler wrestler={wrestler} show={show} key={id}/>
                                </li>
                            ))}
                        </ul>
                        {displayedWrestlers.length === 0 && (
                            <p className="no-wrestlers">
                                {showAllWrestlers && showInactiveWrestlers
                                    ? "Aucun wrestler à afficher pour ce show"
                                    : !showInactiveWrestlers && inactiveInSource.length > 0 && sourceWrestlers.length === inactiveInSource.length
                                        ? "Seules des superstars inactives (👻). Cliquez sur « Inactifs » pour les afficher."
                                        : showAllWrestlers
                                            ? "Aucun wrestler à afficher pour ce show"
                                            : linkedWrestlers.length === 0 && filteredWrestlers.length > 0
                                                ? "Aucune superstar du roster. Cliquez sur « Toutes » pour voir les présences inhabituelles."
                                                : "Aucun wrestler à afficher pour ce show"}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
