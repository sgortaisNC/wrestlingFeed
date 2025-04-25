import React from 'react';
import Link from 'next/link';
import css from './Wiki.module.scss';

export default function WikiPage() {
  return (
    <div className={css.wikiContainer}>
      <h1 className={css.title}>Documentation du projet</h1>
      
      <div className={css.grid}>
        {/* Colonne 1: Pages */}
        <section className={css.section}>
          <h2 className={css.sectionTitle}>Pages</h2>
          
          <div>
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Page d&apos;accueil</h3>
              <p className={css.text}>
                La page d&apos;accueil affiche tous les shows de wrestling programmés jusqu&apos;à la date actuelle.
                Les shows incluent Raw (lundi), NXT (mardi), SmackDown (vendredi) et les PLE (Premium Live Events).
                Pour chaque show, on peut voir les lutteurs disponibles.
              </p>
              <p className={css.text}>
                Le système filtre les lutteurs qui n&apos;ont pas encore participé à un match à la date du show.
              </p>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Pages de lutteurs</h3>
              <p className={css.text}>
                Ces pages affichent les informations détaillées sur chaque lutteur, y compris leur historique de matchs.
              </p>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Tier List</h3>
              <p className={css.text}>
                Cette page permet de visualiser et gérer une tier list des lutteurs, permettant de les classer 
                selon leur popularité ou performance. Les utilisateurs peuvent organiser les lutteurs en différentes 
                catégories pour mieux suivre les talents.
              </p>
            </div>
          </div>
        </section>
        
        {/* Colonne 2: Composants */}
        <section className={css.section}>
          <h2 className={css.sectionTitle}>Composants</h2>
          
          <div>
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Show</h3>
              <p className={css.text}>
                Ce composant affiche un show individuel avec sa date, son titre et la liste des lutteurs disponibles.
                Il est utilisé sur la page d&apos;accueil pour afficher chaque événement.
              </p>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Wrestler</h3>
              <p className={css.text}>
                Ce composant affiche les informations d&apos;un lutteur, potentiellement avec des fonctionnalités 
                pour voir et gérer ses matchs.
              </p>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Menu</h3>
              <p className={css.text}>
                Le menu de navigation principal de l&apos;application permettant d&apos;accéder aux différentes sections.
              </p>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Toast</h3>
              <p className={css.text}>
                Composant pour afficher des notifications temporaires à l&apos;utilisateur.
              </p>
            </div>
          </div>
        </section>
        
        {/* Colonne 3: Architecture */}
        <section className={css.section}>
          <h2 className={css.sectionTitle}>Architecture</h2>
          
          <div>
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Base de données</h3>
              <p className={css.text}>
                L&apos;application utilise Prisma comme ORM pour interagir avec la base de données.
                Les principales entités sont:
              </p>
              <ul className={css.list}>
                <li>Wrestler: représente un lutteur avec son nom et autres attributs</li>
                <li>Match: représente un match entre lutteurs à une date spécifique</li>
                <li>Options: stocke des paramètres globaux comme la date actuelle du système</li>
              </ul>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Frontend</h3>
              <p className={css.text}>
                L&apos;application est construite avec Next.js, utilisant les App Router pour la navigation.
                Les pages sont construites en combinant des composants réutilisables.
              </p>
            </div>
          </div>
        </section>
        
        {/* Colonne 4: API Endpoints */}
        <section className={css.section}>
          <h2 className={css.sectionTitle}>API Endpoints</h2>
          
          <div>
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Wrestlers</h3>
              <p className={css.text}>
                Gestion des lutteurs dans l&apos;application.
              </p>
              <ul className={css.list}>
                <li><code>GET /api/wrestlers</code> - Récupérer tous les lutteurs</li>
                <li><code>POST /api/wrestlers</code> - Créer un nouveau lutteur</li>
                <li><code>GET /api/wrestlers/[id]</code> - Récupérer un lutteur spécifique</li>
              </ul>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Matches</h3>
              <p className={css.text}>
                Gestion des matchs de lutte.
              </p>
              <ul className={css.list}>
                <li><code>GET /api/matches</code> - Récupérer tous les matchs</li>
                <li><code>GET /api/matches/count</code> - Compter le nombre de matchs</li>
                <li><code>GET /api/matches/[id]</code> - Récupérer un match spécifique</li>
              </ul>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Tier</h3>
              <p className={css.text}>
                Gestion des tiers pour les lutteurs.
              </p>
              <ul className={css.list}>
                <li><code>GET /api/tier</code> - Récupérer les informations de tier</li>
                <li><code>POST /api/tier</code> - Mettre à jour les tiers</li>
              </ul>
            </div>
            
            <div className={css.contentBlock}>
              <h3 className={css.blockTitle}>Autres Endpoints</h3>
              <ul className={css.list}>
                <li><code>/api/seen</code> - Marquer un élément comme vu</li>
                <li><code>/api/seen-show</code> - Marquer un show comme vu</li>
                <li><code>/api/match</code> - Gestion individuelle des matchs</li>
                <li><code>/api/roster</code> - Gestion du roster</li>
                <li><code>/api/active</code> - Gestion des lutteurs actifs</li>
                <li><code>/api/add</code> - Ajouter des éléments</li>
                <li><code>/api/delete</code> - Supprimer des éléments</li>
                <li><code>/api/seed</code> - Initialiser des données</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      
      <div className={css.footer}>
        <Link href="/" className={css.button}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
} 