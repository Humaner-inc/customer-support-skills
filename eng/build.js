#!/usr/bin/env node
// Compiles every industry package into dist/catalog.json and a small typed
// accessor API (dist/index.js + dist/index.d.ts). Consumers (e.g. Humaner's
// private runtime) depend on this package and adapt the catalog into their
// own internal types.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadCatalog } from './load-catalog.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST_DIR = join(ROOT, 'dist');
const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8'));

const catalog = loadCatalog();

for (const [id, industry] of Object.entries(catalog.industries)) {
  if (industry.missing) {
    console.error(`\u2717 industries/${id} is missing required skills: ${industry.missing.join(', ')}`);
    console.error('Run `npm run validate` for the full report.');
    process.exit(1);
  }
}

mkdirSync(DIST_DIR, { recursive: true });

const catalogDocument = {
  skillzVersion: pkg.version,
  generatedAt: new Date().toISOString(),
  ...catalog
};

writeFileSync(join(DIST_DIR, 'catalog.json'), JSON.stringify(catalogDocument, null, 2) + '\n');

const indexJs = [
  '// GENERATED FILE \u2014 produced by `npm run build` from industries/**/*.',
  '// Do not edit; edit the markdown source packages instead.',
  "import { createRequire } from 'node:module';",
  '',
  'const require = createRequire(import.meta.url);',
  "const catalog = require('./catalog.json');",
  '',
  'export const SKILLZ_VERSION = catalog.skillzVersion;',
  '',
  'export function listIndustries() {',
  '  return Object.values(catalog.industries);',
  '}',
  '',
  'export function getIndustry(id) {',
  '  return catalog.industries[id];',
  '}',
  '',
  'export function listIndustryIds() {',
  '  return Object.keys(catalog.industries);',
  '}',
  '',
  'export default catalog;',
  ''
].join('\n');
writeFileSync(join(DIST_DIR, 'index.js'), indexJs);

const indexDts = [
  '// GENERATED FILE \u2014 produced by `npm run build`.',
  '',
  'export interface CoreSkill {',
  '  name: string;',
  '  description: string;',
  "  type: 'core';",
  '  baselineTone: string[];',
  '  fallback: string;',
  '  commonTopics: string[];',
  '  domainTerms: string;',
  '  exampleBusinessTypes: string;',
  '}',
  '',
  'export interface BehaviorSkill {',
  '  name: string;',
  '  description: string;',
  "  type: 'behavior';",
  '  rules: string[];',
  '  evalCommon: string[];',
  '  evalEdge: string[];',
  '}',
  '',
  'export interface EscalationSkill {',
  '  name: string;',
  '  description: string;',
  "  type: 'escalation';",
  '  triggers: string[];',
  '  evalEscalation: string[];',
  '}',
  '',
  'export interface GuardrailsSkill {',
  '  name: string;',
  '  description: string;',
  "  type: 'guardrails';",
  '  forbiddenTopics: string[];',
  '  evalTraps: string[];',
  '}',
  '',
  'export interface ProblemSolvingSkill {',
  '  name: string;',
  '  description: string;',
  "  type: 'problem-solving';",
  '  id: string;',
  '  whenToUse: string;',
  '  procedure: string;',
  '  doNot: string[];',
  '}',
  '',
  'export type Skill = CoreSkill | BehaviorSkill | EscalationSkill | GuardrailsSkill | ProblemSolvingSkill;',
  '',
  'export interface IndustryPackage {',
  '  id: string;',
  '  skills: {',
  '    core: CoreSkill;',
  '    behavior: BehaviorSkill;',
  '    escalation: EscalationSkill;',
  '    guardrails: GuardrailsSkill;',
  '    [key: string]: Skill;',
  '  };',
  '}',
  '',
  'export const SKILLZ_VERSION: string;',
  'export function listIndustries(): IndustryPackage[];',
  'export function getIndustry(id: string): IndustryPackage | undefined;',
  'export function listIndustryIds(): string[];',
  '',
  'declare const catalog: {',
  '  skillzVersion: string;',
  '  generatedAt: string;',
  '  industries: Record<string, IndustryPackage>;',
  '};',
  'export default catalog;',
  ''
].join('\n');
writeFileSync(join(DIST_DIR, 'index.d.ts'), indexDts);

// ---- regenerate the README industries table between markers ------------

const readmePath = join(ROOT, 'README.md');
if (existsSync(readmePath)) {
  const readme = readFileSync(readmePath, 'utf8');
  const startMarker = '<!-- INDUSTRIES:START -->';
  const endMarker = '<!-- INDUSTRIES:END -->';
  const startIndex = readme.indexOf(startMarker);
  const endIndex = readme.indexOf(endMarker);

  if (startIndex !== -1 && endIndex !== -1) {
    const rows = Object.entries(catalog.industries)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([id, industry]) => {
        const skillCount = Object.keys(industry.skills).length;
        const baseline = 4;
        const problemSolving = skillCount - baseline;
        const desc = industry.skills.core?.description ?? '';
        return `| [${id}](./industries/${id}) | ${baseline} baseline + ${problemSolving} problem-solving | ${desc} |`;
      })
      .join('\n');

    const table = [
      startMarker,
      '<!-- Auto-generated by `npm run build` \u2014 do not edit this table by hand. -->',
      '| Industry | Skills | Description |',
      '| --- | --- | --- |',
      rows,
      endMarker
    ].join('\n');

    const updated = readme.slice(0, startIndex) + table + readme.slice(endIndex + endMarker.length);
    if (updated !== readme) {
      writeFileSync(readmePath, updated);
    }
  }
}

const industryCount = Object.keys(catalog.industries).length;
const totalSkills = Object.values(catalog.industries).reduce(
  (sum, ind) => sum + Object.keys(ind.skills).length, 0
);
console.log(
  `\u2713 built dist/catalog.json + dist/index.{js,d.ts} \u2014 ${industryCount} industries, ${totalSkills} total skills.`
);
