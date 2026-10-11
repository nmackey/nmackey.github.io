import { escapeAttr, escapeHtml } from './escape.js';
import { formatDisplayDate, type Post, type Section } from './markdown.js';
import type { Site } from './site.js';

const SECTION_LABEL: Record<Section, string> = {
  web: 'Web development',
  personal: 'Personal',
};

export function socialLinks(site: Site): string {
  return `<ul class="social">
  <li><a href="${escapeAttr(site.social.github)}">GitHub</a></li>
  <li><a href="${escapeAttr(site.social.linkedin)}">LinkedIn</a></li>
</ul>`;
}

export function analyticsSnippet(site: Site): string {
  if (!site.cloudflareBeaconToken) {
    return '';
  }
  const payload = JSON.stringify({ token: site.cloudflareBeaconToken });
  return `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='${payload}'></script>`;
}

export function giscusSnippet(site: Site): string {
  const { repo, repoId, category, categoryId, mapping } = site.giscus;
  if (!repo || !repoId || !categoryId) {
    return '';
  }
  return `<section class="comments" id="comments" aria-label="Comments">
  <h2>Comments</h2>
  <script src="https://giscus.app/client.js"
    data-repo="${escapeAttr(repo)}"
    data-repo-id="${escapeAttr(repoId)}"
    data-category="${escapeAttr(category)}"
    data-category-id="${escapeAttr(categoryId)}"
    data-mapping="${escapeAttr(mapping || 'pathname')}"
    data-strict="0"
    data-reactions-enabled="1"
    data-emit-metadata="0"
    data-input-position="bottom"
    data-theme="noborder_light"
    data-lang="en"
    data-loading="lazy"
    crossorigin="anonymous"
    async>
  </script>
</section>`;
}

export function feedLinks(options: { href: string; title: string }): string {
  return `<link rel="alternate" type="application/rss+xml" title="${escapeAttr(options.title)}" href="${escapeAttr(options.href)}">`;
}

export function siteNav(site: Site, current?: Section | 'home'): string {
  const webCurrent = current === 'web' ? ' aria-current="page"' : '';
  const personalCurrent = current === 'personal' ? ' aria-current="page"' : '';
  const homeCurrent = current === 'home' ? ' aria-current="page"' : '';
  return `<header class="site-header">
  <a class="skip-link" href="#main">Skip to content</a>
  <div class="site-header-inner">
    <a class="wordmark" href="/"${homeCurrent}>${escapeHtml(site.name)}</a>
    <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" data-nav>
      <ul>
        <li><a href="/web/"${webCurrent}>Web</a></li>
        <li><a href="/personal/"${personalCurrent}>Personal</a></li>
        <li><a href="/feed.xml">RSS</a></li>
      </ul>
    </nav>
  </div>
</header>`;
}

export function siteFooter(site: Site): string {
  const year = new Date().getFullYear();
  return `<footer class="site-footer">
  <p>© ${year} ${escapeHtml(site.name)}</p>
  ${socialLinks(site)}
</footer>`;
}

export function postList(posts: Post[], emptyMessage: string): string {
  if (posts.length === 0) {
    return `<p class="empty-state">${escapeHtml(emptyMessage)}</p>`;
  }
  const items = posts
    .map((post) => {
      const tags = post.tags.length
        ? `<p class="post-tags">${post.tags.map((tag) => escapeHtml(tag)).join(', ')}</p>`
        : '';
      return `<article class="post-card">
  <h2><a href="${escapeAttr(post.path)}">${escapeHtml(post.title)}</a></h2>
  <p class="meta"><time datetime="${escapeAttr(post.date)}">${formatDisplayDate(post.date)}</time></p>
  <p class="excerpt">${escapeHtml(post.excerpt)}</p>
  ${tags}
</article>`;
    })
    .join('\n');
  return `<div class="post-list">${items}</div>`;
}

export function sectionLabel(section: Section): string {
  return SECTION_LABEL[section];
}

export function redirectHtml(to: string, canonical: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${escapeAttr(to)}">
  <link rel="canonical" href="${escapeAttr(canonical)}">
  <title>Redirecting</title>
  <script>location.replace(${JSON.stringify(to)});</script>
</head>
<body>
  <p>This page has moved to <a href="${escapeAttr(to)}">${escapeHtml(to)}</a>.</p>
</body>
</html>
`;
}
