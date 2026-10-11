import { readFileSync } from 'node:fs';
import { SITE_JSON } from './paths.js';

export type Site = {
  name: string;
  url: string;
  description: string;
  author: string;
  tagline: string;
  social: {
    github: string;
    linkedin: string;
  };
  giscus: {
    repo: string;
    repoId: string;
    category: string;
    categoryId: string;
    mapping: string;
  };
  cloudflareBeaconToken: string;
};

export function loadSite(): Site {
  return JSON.parse(readFileSync(SITE_JSON, 'utf8')) as Site;
}

export function siteOrigin(site: Site): string {
  return site.url.replace(/\/$/, '');
}
