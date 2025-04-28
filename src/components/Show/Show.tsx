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

export const Show = ({show, className}) => {

    const [wrestlers, setWrestlers] = useState(show.wrestlers);
    const [showMarkedAsSeen, setShowMarkedAsSeen] = useState(false);
    
    if (!wrestlers) return;

    const filteredWrestlers = wrestlers.filter((wrestler) => {
        const lastMatch = wrestler.match.find((match) => match.date.toLocaleDateString() === new Date(show.date).toLocaleDateString());
        return lastMatch === undefined;
    });
    
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
                        {filteredWrestlers && filteredWrestlers.map((wrestler,id) => (
                                <li key={id} data-wrestler={wrestler.id}>
                                    <Wrestler wrestler={wrestler} show={show} key={id}/>
                                </li>
                            ))}
                        </ul>
                        {filteredWrestlers.length === 0 && (
                            <p className="no-wrestlers">Aucun wrestler à afficher pour ce show</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
