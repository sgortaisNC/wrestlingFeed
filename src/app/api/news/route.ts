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

export async function GET() {
  try {
    const feedUrl = 'https://www.bodyslam.net/category/news/feed/';
    const feed = await parser.parseURL(feedUrl);

    // Filtrer les articles tagués WWE
    const wweNews = feed.items.filter((item: RSSItem) => {
      // Vérifier dans les catégories/tags
      const categories = item.categories || [];
      const hasWWE = categories.some((cat: string) => 
        cat.toLowerCase().includes('wwe')
      );

      // Vérifier aussi dans le titre et le contenu
      const title = (item.title || '').toLowerCase();
      const content = ((item.content || item.contentSnippet) || '').toLowerCase();
      
      // Rechercher "wwe" comme mot entier (pas dans d'autres mots)
      const wweRegex = /\bwwe\b/i;
      
      return hasWWE || 
             wweRegex.test(title) || 
             wweRegex.test(content);
    });

    // Formater les résultats
    const formattedNews = wweNews.map((item: RSSItem) => ({
      title: item.title || 'Sans titre',
      link: item.link || '',
      pubDate: item.pubDate || '',
      content: item.contentSnippet || item.content || '',
      categories: item.categories || []
    }));

    return NextResponse.json({
      news: formattedNews,
      total: formattedNews.length
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des nouvelles WWE:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des nouvelles WWE' },
      { status: 500 }
    );
  }
}
