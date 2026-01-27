import { Post } from '../../types';

export const generatePinterestRSS = (posts: Post[]): string => {
    const now = new Date().toUTCString();
    const title = "VitrineX Generated Feed";
    const desc = "Feed RSS gerado automaticamente pelo VitrineX AI para publicação no Pinterest e outras redes.";
    const link = "https://vitrinex.ai"; // Placeholder URL

    let items = '';

    posts.forEach(post => {
        // Pinterest RSS requer imagem. Se não tiver, pula.
        if (!post.image_url || post.image_url.startsWith('data:')) return;

        items += `
    <item>
      <title><![CDATA[${post.title || "Post"}]]></title>
      <link>${link}</link>
      <description><![CDATA[${post.content_text} ${(post.hashtags || []).join(' ')}]]></description>
      <pubDate>${now}</pubDate>
      <guid isPermaLink="false">${post.id}</guid>
      <enclosure url="${post.image_url}" type="image/jpeg" length="0" />
    </item>`;
    });

    return `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${link}</link>
    <description>${desc}</description>
    <language>pt-br</language>
    <lastBuildDate>${now}</lastBuildDate>
    ${items}
  </channel>
</rss>`;
};
