import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { copyStaticAssets } from './copy.js';
import { escapeAttr, escapeHtml } from './escape.js';
import {
  analyticsSnippet,
  feedLinks,
  giscusSnippet,
  postList,
  redirectHtml,
  sectionLabel,
  siteFooter,
  siteNav,
} from './html.js';
import { formatDisplayDate, loadAllPosts, loadPosts, loadSectionPage, type Section } from './markdown.js';
import { DIST, TEMPLATES } from './paths.js';
import { renderRss } from './rss.js';
import { loadSite, siteOrigin } from './site.js';
import { render } from './templates.js';

const OLD_POST_REDIRECTS = [
  'library-webpack-babel',
  'decorate-the-world',
  'angular-in-a-material-world',
  'twice-the-work-half-the-time',
  'angular-1-3',
];

function write(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents);
}

function layoutVars(options: {
  title: string;
  description: string;
  url: string;
  feedHref: string;
  feedTitle: string;
  bodyClass: string;
  nav: string;
  content: string;
  extraHead?: string;
}): Record<string, string> {
  const site = loadSite();
  return {
    NAME: escapeHtml(site.name),
    TAGLINE: escapeHtml(site.tagline),
    TITLE: escapeHtml(options.title),
    DESCRIPTION: escapeAttr(options.description),
    URL: escapeAttr(options.url),
    FEED_LINKS: feedLinks({ href: options.feedHref, title: options.feedTitle }),
    ANALYTICS: analyticsSnippet(site),
    BODY_CLASS: options.bodyClass,
    NAV: options.nav,
    CONTENT: options.content,
    FOOTER: siteFooter(site),
    EXTRA_HEAD: options.extraHead ?? '',
  };
}

export async function generateSite(): Promise<void> {
  const site = loadSite();
  const origin = siteOrigin(site);
  const landingTemplate = readFileSync(join(TEMPLATES, 'landing.html'), 'utf8');
  const listTemplate = readFileSync(join(TEMPLATES, 'list.html'), 'utf8');
  const postTemplate = readFileSync(join(TEMPLATES, 'post.html'), 'utf8');

  mkdirSync(DIST, { recursive: true });
  copyStaticAssets();

  write(
    join(DIST, 'index.html'),
    render(
      landingTemplate,
      layoutVars({
        title: site.name,
        description: site.description,
        url: `${origin}/`,
        feedHref: '/feed.xml',
        feedTitle: `${site.name} RSS`,
        bodyClass: 'landing',
        nav: siteNav(site, 'home'),
        content: '',
        extraHead:
          feedLinks({ href: '/web/feed.xml', title: `${site.name} web RSS` }) +
          '\n  ' +
          feedLinks({ href: '/personal/feed.xml', title: `${site.name} personal RSS` }),
      }),
    ),
  );

  const allPosts = await loadAllPosts();
  write(
    join(DIST, 'feed.xml'),
    renderRss({
      site,
      posts: allPosts,
      title: site.name,
      description: site.description,
      feedPath: '/feed.xml',
    }),
  );

  for (const section of ['web', 'personal'] as const) {
    await buildSection(section, listTemplate, postTemplate);
  }

  for (const slug of OLD_POST_REDIRECTS) {
    write(
      join(DIST, slug, 'index.html'),
      redirectHtml(`/web/${slug}/`, `${origin}/web/${slug}/`),
    );
  }

  console.log(`Built ${allPosts.length} posts into dist/`);
}

async function buildSection(
  section: Section,
  listTemplate: string,
  postTemplate: string,
): Promise<void> {
  const site = loadSite();
  const origin = siteOrigin(site);
  const page = await loadSectionPage(section);
  const posts = await loadPosts(section);
  const title = page?.title ?? sectionLabel(section);
  const intro = page?.html ?? '';
  const emptyMessage =
    section === 'personal'
      ? 'No personal posts yet. Add a markdown file in content/personal/ to publish one.'
      : 'No posts yet.';

  write(
    join(DIST, section, 'index.html'),
    render(
      listTemplate,
      layoutVars({
        title: `${title} · ${site.name}`,
        description: site.description,
        url: `${origin}/${section}/`,
        feedHref: `/${section}/feed.xml`,
        feedTitle: `${site.name} ${title} RSS`,
        bodyClass: `section section-${section}`,
        nav: siteNav(site, section),
        content: `<div class="section-intro"><h1>${escapeHtml(title)}</h1>${intro}</div>
${postList(posts, emptyMessage)}`,
      }),
    ),
  );

  write(
    join(DIST, section, 'feed.xml'),
    renderRss({
      site,
      posts,
      title: `${site.name} · ${title}`,
      description: site.description,
      feedPath: `/${section}/feed.xml`,
    }),
  );

  for (const post of posts) {
    const comments = post.comments ? giscusSnippet(site) : '';
    const tags = post.tags.length
      ? `<p class="post-tags">${post.tags.map((tag) => escapeHtml(tag)).join(', ')}</p>`
      : '';
    write(
      join(DIST, section, post.slug, 'index.html'),
      render(
        postTemplate,
        layoutVars({
          title: `${post.title} · ${site.name}`,
          description: post.excerpt,
          url: `${origin}${post.path}`,
          feedHref: `/${section}/feed.xml`,
          feedTitle: `${site.name} ${sectionLabel(section)} RSS`,
          bodyClass: `post-page section-${section}`,
          nav: siteNav(site, section),
          content: `<article class="post">
  <header class="post-header">
    <p class="eyebrow"><a href="/${section}/">${escapeHtml(sectionLabel(section))}</a></p>
    <h1>${escapeHtml(post.title)}</h1>
    <p class="meta"><time datetime="${escapeAttr(post.date)}">${formatDisplayDate(post.date)}</time></p>
    ${tags}
  </header>
  <div class="post-body">
    ${post.html}
  </div>
  ${comments}
</article>`,
        }),
      ),
    );
  }
}
