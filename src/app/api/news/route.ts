import { NextResponse } from 'next/server';
import Parser from 'rss-parser';

const parser = new Parser();

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Revalider toutes les 5 minutes

interface RSSItem {
  title?: string;
  link?: string;
  pubDate?: string;
  content?: string;
  contentSnippet?: string;
  categories?: string[];
}

async function fetchAndFilterFeed(feedUrl: string, source: string) {
  try {
    const feed = await parser.parseURL(feedUrl);
    
    const wweNews = feed.items.filter((item: RSSItem) => {
      // Pour bodyslam.net : vérifier les catégories
      if (source === 'bodyslam') {
        const categories = item.categories || [];
        const hasWWE = categories.some((cat: string) => 
          cat.toLowerCase().includes('wwe')
        );
        if (hasWWE) return true;
      }

      // Pour les deux sources : vérifier le titre et la description
      const title = (item.title || '').toLowerCase();
      const description = ((item.content || item.contentSnippet) || '').toLowerCase();
      
      // Rechercher "wwe" comme mot entier (pas dans d'autres mots)
      const wweRegex = /\bwwe\b/i;
      
      return wweRegex.test(title) || wweRegex.test(description);
    });

    return wweNews.map((item: RSSItem) => ({
      title: item.title || 'Sans titre',
      link: item.link || '',
      pubDate: item.pubDate || '',
      content: item.contentSnippet || item.content || '',
      categories: item.categories || [],
      source: source
    }));
  } catch (error) {
    console.error(`Erreur lors de la récupération du flux ${source}:`, error);
    return [];
  }
}

export async function GET() {
  try {
    // Récupérer les nouvelles depuis les deux sources en parallèle
    const [bodyslamNews, fightfulNews] = await Promise.all([
      fetchAndFilterFeed('https://www.bodyslam.net/category/news/feed/', 'bodyslam'),
      fetchAndFilterFeed('https://www.fightful.com/wrestling/rss', 'fightful')
    ]);

    // Combiner les résultats
    const allNews = [...bodyslamNews, ...fightfulNews];

    // Filtrer les nouvelles contenant des mots de spoiler pour éviter les spoilers
    const filteredNews = allNews.filter((item) => {
      const title = (item.title || '').toLowerCase();
      const content = (item.content || '').toLowerCase();
      const text = `${title} ${content}`;
      
      // Liste de mots et expressions de spoiler (formes conjuguées incluses)
      const spoilerPatterns = [
        /\bdefeat(s|ed|ing)?\b/i,           // defeat, defeats, defeated, defeating
        /\bwin(s|ning)?\b/i,                // win, wins, winning
        /\bwon\b/i,                          // won
        /\bbeat(s|ing)?\b/i,                // beat, beats, beating
        /\bbeaten\b/i,                       // beaten
        /\blose(s|ing)?\b/i,                // lose, loses, losing
        /\blost\b/i,                         // lost
        /\bpin(s|ned|ning)?\b/i,            // pin, pins, pinned, pinning
        /\bsubmit(s|ted|ting)?\b/i,         // submit, submits, submitted, submitting
        /\bretain(s|ed|ing)?\b/i,           // retain, retains, retained, retaining
        /\bcrown(s|ed|ing)?\b/i,            // crown, crowns, crowned, crowning
        /\bchampion\b/i,                     // champion (dans le contexte de devenir champion)
        /\bbecomes?\s+(the\s+)?champion/i,   // becomes champion, become the champion
        /\bnew\s+champion/i,                 // new champion
        /\bwins?\s+the\s+title/i,            // wins the title, win the title
        /\bwins?\s+championship/i,          // wins championship
      ];
      
      // Vérifier si le texte contient un des patterns de spoiler
      const hasSpoiler = spoilerPatterns.some(pattern => pattern.test(text));
      
      return !hasSpoiler;
    });

    // Trier par date de publication (les plus récentes en premier)
    filteredNews.sort((a, b) => {
      const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
      const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
      return dateB - dateA;
    });

    return NextResponse.json({
      news: filteredNews,
      total: filteredNews.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des nouvelles WWE:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des nouvelles WWE' },
      { status: 500 }
    );
  }
}
