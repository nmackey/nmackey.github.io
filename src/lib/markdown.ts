import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import matter from 'gray-matter';
import hljs from 'highlight.js';
import { Marked } from 'marked';
import { CONTENT } from './paths.js';

export type Section = 'web' | 'personal';

export type Post = {
  slug: string;
  section: Section;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  comments: boolean;
  html: string;
  path: string;
};

export type SectionPage = {
  section: Section;
  title: string;
  html: string;
};

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      const language = lang && hljs.getLanguage(lang) ? lang : 'plaintext';
      const highlighted = hljs.highlight(text, { language }).value;
      return `<pre><code class="hljs language-${escapeClass(language)}">${highlighted}</code></pre>`;
    },
  },
});

function escapeClass(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '');
}

function parseDate(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === 'string' && value.trim()) {
    return value.trim().slice(0, 10);
  }
  throw new Error('Post is missing a valid date');
}

function parseTags(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.map((tag) => String(tag));
}

export function formatDisplayDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);
}

export async function renderMarkdown(source: string): Promise<string> {
  return String(await marked.parse(source));
}

export async function loadSectionPage(section: Section): Promise<SectionPage | undefined> {
  const file = join(CONTENT, section, 'index.md');
  if (!existsSync(file)) {
    return undefined;
  }
  const parsed = matter(readFileSync(file, 'utf8'));
  const title = typeof parsed.data.title === 'string' ? parsed.data.title : section;
  return {
    section,
    title,
    html: await renderMarkdown(parsed.content),
  };
}

export async function loadPosts(section: Section): Promise<Post[]> {
  const dir = join(CONTENT, section);
  if (!existsSync(dir)) {
    return [];
  }
  const files = readdirSync(dir).filter((name) => name.endsWith('.md') && name !== 'index.md');
  const posts: Post[] = [];

  for (const name of files) {
    const file = join(dir, name);
    const parsed = matter(readFileSync(file, 'utf8'));
    const slug = basename(name, '.md');
    const title = String(parsed.data.title ?? slug);
    const date = parseDate(parsed.data.date);
    const tags = parseTags(parsed.data.tags);
    const excerpt =
      typeof parsed.data.excerpt === 'string'
        ? parsed.data.excerpt
        : parsed.content.trim().split('\n').find((line) => line.trim()) ?? '';
    const comments = parsed.data.comments !== false;
    posts.push({
      slug,
      section,
      title,
      date,
      tags,
      excerpt,
      comments,
      html: await renderMarkdown(parsed.content),
      path: `/${section}/${slug}/`,
    });
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

export async function loadAllPosts(): Promise<Post[]> {
  const posts = [...(await loadPosts('web')), ...(await loadPosts('personal'))];
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
