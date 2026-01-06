"use client";

import { useEffect, useState } from "react";
import css from './News.module.scss';

interface NewsItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  categories: string[];
  source?: string;
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/news');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des nouvelles');
        }
        const data = await response.json();
        setNews(data.news || []);
        setError(null);
      } catch (err) {
        console.error('Erreur:', err);
        setError('Impossible de charger les nouvelles WWE');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={css.container}>
        <div className={css.loading}>Chargement des nouvelles WWE...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={css.container}>
        <div className={css.error}>{error}</div>
      </div>
    );
  }

  return (
    <div className={css.container}>
      <h1 className={css.title}>Nouvelles WWE</h1>
      {news.length === 0 ? (
        <div className={css.empty}>Aucune nouvelle WWE trouvée</div>
      ) : (
        <div className={css.newsList}>
          {news.map((item, index) => (
            <article key={index} className={css.newsItem}>
              <h2 className={css.newsTitle}>
                <a 
                  href={item.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={css.newsLink}
                >
                  {item.title}
                </a>
              </h2>
              {item.pubDate && (
                <time className={css.newsDate}>{formatDate(item.pubDate)}</time>
              )}
              {item.content && (
                <p className={css.newsContent}>{item.content}</p>
              )}
              {item.categories && item.categories.length > 0 && (
                <div className={css.categories}>
                  {item.categories.map((cat, catIndex) => (
                    <span key={catIndex} className={css.category}>{cat}</span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
