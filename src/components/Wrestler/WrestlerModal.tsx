'use client';

import { useState } from 'react';
import { Toast } from '@/components/Toast/Toast';
import { useRouter } from 'next/navigation';


interface WrestlerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WrestlerModal = ({ isOpen, onClose }: WrestlerModalProps) => {
  const [toastMessage, setToastMessage] = useState('');
  const router = useRouter();

  const addWrestler = async (e) => {
    e.preventDefault();
    const name = e.target.name.value;
    const showName = e.target.showName.value;
    const gender = e.target.gender.value;
    
    // Récupération de la date via une API au lieu d'un appel direct à Prisma
    const dateResponse = await fetch('/api/date', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const dateData = await dateResponse.json();


    try {
      const response = await fetch('/api/add', {
        method: 'POST',
        body: JSON.stringify({
          name,
          showName,
          lastSeen: new Date(dateData.data.value),
          gender
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setToastMessage(`Wrestler ${data.name} ajouté avec succès!`);
      e.target.reset();
      
      // Fermer la modale après 1 seconde et rafraîchir la page
      setTimeout(() => {
        onClose();
        router.refresh(); // Rafraîchit la page pour mettre à jour les shows
      }, 1000);
    } catch (error) {
      setToastMessage('Erreur lors de l\'ajout du wrestler');
      console.error(error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`}>
      <div className="backdrop" onClick={onClose}></div>
      <div className="content wrestler-modal-content">
        <div className="header">
          <h3>Ajouter un nouveau Wrestler</h3>
          <div className="header-actions">
            <button 
              onClick={onClose} 
              className="modal-close-btn"
              aria-label="Fermer"
              title="Fermer"
            ></button>
          </div>
        </div>
        <div className="modal-content-body">
          <form action="#" onSubmit={addWrestler}>
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="name" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Nom</label>
              <input 
                type="text" 
                id="name" 
                name="name" 
                placeholder="Nom du wrestler" 
                required 
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '5px', 
                  border: '1px solid #ccc' 
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="gender" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Genre</label>
              <select 
                name="gender" 
                id="gender" 
                title="Genre" 
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '5px', 
                  border: '1px solid #ccc' 
                }}
              >
                <option value="male">Homme</option>
                <option value="female">Femme</option>
              </select>
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label htmlFor="showName" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Show</label>
              <select 
                name="showName" 
                id="showName" 
                title="Show" 
                required
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '5px', 
                  border: '1px solid #ccc' 
                }}
              >
                <option value="Raw">Raw</option>
                <option value="SmackDown">SmackDown</option>
                <option value="NXT">NXT</option>
                <option value="Evolve">Evolve</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', marginBottom: '20px' }}>
              <button 
                type="button" 
                onClick={onClose}
                style={{
                  padding: '8px 16px',
                  borderRadius: '5px',
                  background: '#f2f2f2',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Annuler
              </button>
              <button 
                type="submit"
                className="cta"
              >
                Ajouter
              </button>
            </div>
          </form>
        </div>
        {toastMessage && <Toast text={toastMessage} />}
      </div>
    </div>
  );
}; 