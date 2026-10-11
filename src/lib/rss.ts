import { escapeXml } from './escape.js';
import type { Post } from './markdown.js';
import { siteOrigin, type Site } from './site.js';

function rfc822(isoDate: string): string {
  return new Date(`${isoDate}T12:00:00Z`).toUTCString();
}

export function renderRss(options: {
  site: Site;
  posts: Post[];
  title: string;
  description: string;
  feedPath: string;
}): string {
  const origin = siteOrigin(options.site);
  const feedUrl = `${origin}${options.feedPath}`;
  const items = options.posts
    .map((post) => {
      const url = `${origin}${post.path}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(url)}</link>
      <guid>${escapeXml(url)}</guid>
      <pubDate>${rfc822(post.date)}</pubDate>
      <description>${escapeXml(post.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(options.title)}</title>
    <link>${escapeXml(origin)}/</link>
    <description>${escapeXml(options.description)}</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}
