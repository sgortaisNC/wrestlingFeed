"use client";
import style from './Card.module.css';

function roster(e) {
    fetch('/api/roster', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: e.target.dataset.id, roster: e.target.dataset.value}),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            e.target.parentNode.parentNode.remove();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

function actif(e) {
    fetch('/api/active', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: e.target.dataset.id, active: e.target.dataset.value}),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            e.target.parentNode.parentNode.remove();
        })
        .catch((error) => {
            console.error('Error:', error);
        });

}

function skip(e) {
    e.target.parentNode.parentNode.remove();
}

function deleteWrestler(e) {
    fetch('/api/delete', {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({id: e.target.dataset.id}),
    })
        .then(response => response.json())
        .then(data => {
            console.log('Success:', data);
            window.location.reload();
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}

export const Card = ({question, last}) => {
    return (
        <div className={style.question}>
            <h2>{question.name} <button className={style.button} onClick={deleteWrestler} data-id={question.id}>X</button></h2>
            <div className={style.choices}>
                {question.question === "show" ?
                    <>
                        <button className={style.button} data-id={question.id} data-value={"SmackDown"}
                                onClick={roster}>SmackDown
                        </button>
                        <button className={style.button} data-id={question.id} data-value={"Raw"} onClick={roster}>Raw
                        </button>
                        <button className={style.button} data-id={question.id} data-value={"NXT"} onClick={roster}>NXT
                        </button>
                        <button className={style.button} data-id={question.id} data-value={"Free"}
                                onClick={roster}>Free Agent
                        </button>
                        <button className={style.button} onClick={skip}>Ne sais pas</button>
                    </>
                    :
                    <>
                        <button className={style.button} data-id={question.id} data-value={1} onClick={actif}>Actif
                        </button>
                        <button className={style.button} data-id={question.id} data-value={0} onClick={actif}>Inactif
                        </button>
                        <button className={style.button} onClick={skip}>Ne sais pas</button>
                    </>
                }
            </div>
        </div>
    )
}
