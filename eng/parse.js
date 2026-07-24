import { readFileSync } from 'node:fs';

/**
 * Splits a markdown file into `{ frontmatter, body }`. `frontmatter` is the
 * raw string between the leading `---` fences (or null if absent).
 */
export function splitFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: raw };
  }
  return { frontmatter: match[1], body: match[2] };
}

function stripQuotes(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

/**
 * Parses the flat subset of YAML used by this repo's frontmatter: string
 * scalars (optionally quoted).
 */
export function parseFrontmatter(frontmatterRaw) {
  const data = {};
  if (!frontmatterRaw) return data;

  for (const line of frontmatterRaw.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const keyMatch = line.match(/^([A-Za-z0-9_-]+):\s?(.*)$/);
    if (!keyMatch) continue;
    const [, key, rawValue] = keyMatch;
    data[key] = stripQuotes(rawValue);
  }

  return data;
}

/** Reads and parses a SKILL.md file. */
export function readFrontmatterFile(path) {
  const raw = readFileSync(path, 'utf8');
  const { frontmatter, body } = splitFrontmatter(raw);
  return { data: parseFrontmatter(frontmatter), body: body.trim() };
}

/**
 * Returns the markdown slice for a `## Heading` section (up to the next
 * heading of the same or higher level), or the whole document if no heading
 * is given.
 */
export function extractSection(markdown, headingText) {
  if (!headingText) return markdown;
  const headingRegex = new RegExp(
    `^##\\s+${headingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`,
    'im'
  );
  const lines = markdown.split(/\r?\n/);
  const startIndex = lines.findIndex((line) => headingRegex.test(line));
  if (startIndex === -1) return '';

  const rest = lines.slice(startIndex + 1);
  const endIndex = rest.findIndex((line) => /^#{1,2}\s+/.test(line));
  return (endIndex === -1 ? rest : rest.slice(0, endIndex)).join('\n');
}

/** Extracts every `- bullet` line from a markdown slice. */
export function extractBullets(markdown) {
  const items = [];
  for (const line of markdown.split(/\r?\n/)) {
    const match = line.match(/^-\s+(.+)$/);
    if (match) items.push(match[1].trim());
  }
  return items;
}

/** Extracts bullets scoped to a specific `## Heading`. */
export function extractSectionBullets(markdown, headingText) {
  return extractBullets(extractSection(markdown, headingText));
}

/**
 * Extracts the first blockquote from a section, joining multi-line
 * blockquotes with a space.
 */
export function extractBlockquote(markdown, headingText) {
  const scope = headingText ? extractSection(markdown, headingText) : markdown;
  const quoteLines = scope
    .split(/\r?\n/)
    .filter((line) => line.trim().startsWith('>'))
    .map((line) => line.trim().replace(/^>\s?/, ''));
  return quoteLines.join(' ').trim();
}

/**
 * Extracts a paragraph (non-bullet, non-heading lines) from a section as a
 * single trimmed string. Useful for domain terms written as prose.
 */
export function extractParagraph(markdown, headingText) {
  const scope = headingText ? extractSection(markdown, headingText) : markdown;
  const lines = scope
    .split(/\r?\n/)
    .filter((line) => line.trim() && !line.trim().startsWith('-') && !line.trim().startsWith('#') && !line.trim().startsWith('>'));
  return lines.map((l) => l.trim()).join(' ').trim();
}
