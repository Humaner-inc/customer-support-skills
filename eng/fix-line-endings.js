#!/usr/bin/env node
// Normalizes CRLF -> LF across the repo (excluding node_modules/dist/.git).
// Run before committing, especially on Windows.

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const IGNORED = new Set(['node_modules', 'dist', '.git']);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (IGNORED.has(entry.name)) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

let fixed = 0;
for (const file of walk(ROOT)) {
  const raw = readFileSync(file, 'utf8');
  if (raw.includes('\r\n')) {
    writeFileSync(file, raw.replace(/\r\n/g, '\n'));
    fixed++;
  }
}
console.log(`✓ normalized line endings in ${fixed} file(s).`);
