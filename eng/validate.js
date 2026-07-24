#!/usr/bin/env node
// Validates every industry skill against SPEC.md: required baseline skill
// folders present, frontmatter matches .schemas/skill.schema.json, required
// sections are non-empty, problem-solving skills have the expected structure,
// and a "structures never values" lint runs across every markdown file.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkSchema } from './schema-check.js';
import {
  BASELINE_SKILLS,
  INDUSTRIES_DIR,
  listIndustryIds,
  listSkillIds,
  loadIndustry,
  loadSkill
} from './load-catalog.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const schemaDir = join(ROOT, '.schemas');
const skillSchema = JSON.parse(readFileSync(join(schemaDir, 'skill.schema.json'), 'utf8'));

let errorCount = 0;

function report(scope, errors) {
  if (!errors.length) return;
  errorCount += errors.length;
  console.error(`\n\u2717 ${scope}`);
  for (const error of errors) console.error(`  - ${error}`);
}

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
}

const VALUE_LEAK_PATTERNS = [
  { name: 'absolute price', pattern: /\$\d/ },
  { name: 'hardcoded phone number', pattern: /\+?\d{3}[-.\s]\d{3}[-.\s]\d{4}/ },
  {
    name: 'hardcoded contact email',
    pattern: /\b[a-z0-9._%+-]+@(?!example\.com)[a-z0-9.-]+\.[a-z]{2,}\b/i
  }
];

function isTrapFile(filePath) {
  const normalized = filePath.replace(/\\/g, '/');
  return normalized.endsWith('guardrails/SKILL.md');
}

function lintStructuresNeverValues(filePath, content) {
  if (isTrapFile(filePath)) return [];
  const errors = [];
  for (const { name, pattern } of VALUE_LEAK_PATTERNS) {
    if (pattern.test(content)) {
      errors.push(`possible ${name} found \u2014 values belong only in guardrails eval traps as false premises`);
    }
  }
  return errors;
}

// ---- industry packages ---------------------------------------------------

const industryIds = listIndustryIds();
if (!industryIds.length) {
  report('industries', ['no industry folders found']);
}

for (const id of industryIds) {
  const industry = loadIndustry(id);
  const scope = `industries/${id}`;

  if (industry.missing) {
    report(scope, industry.missing.map((file) => `missing required baseline skill: ${file}`));
  }

  const allSkillIds = listSkillIds(id);
  for (const skillId of allSkillIds) {
    const rawSkill = loadSkill(id, skillId);
    if (rawSkill.missing) continue;

    const skillScope = `${scope}/${skillId}`;
    const { body, ...frontmatter } = rawSkill;
    const schemaErrors = checkSchema(skillSchema, frontmatter, skillScope);
    report(skillScope, schemaErrors);
  }

  const { skills } = industry;
  const contentErrors = [];

  if (skills.core) {
    if (!skills.core.baselineTone.length) contentErrors.push('core/SKILL.md has no `## Baseline tone` bullets');
    if (!skills.core.commonTopics.length) contentErrors.push('core/SKILL.md has no `## Common topics` bullets');
    if (!skills.core.domainTerms) contentErrors.push('core/SKILL.md has no `## Domain terms` content');
    if (!skills.core.fallback) contentErrors.push('core/SKILL.md has no `## Fallback` blockquote');
  }
  if (skills.behavior) {
    if (!skills.behavior.rules.length) contentErrors.push('behavior/SKILL.md has no `## Rules` bullets');
    if (!skills.behavior.evalCommon.length) contentErrors.push('behavior/SKILL.md has no `## Eval scenarios -- common` bullets');
    if (!skills.behavior.evalEdge.length) contentErrors.push('behavior/SKILL.md has no `## Eval scenarios -- edge` bullets');
  }
  if (skills.escalation) {
    if (!skills.escalation.triggers.length) contentErrors.push('escalation/SKILL.md has no `## Triggers` bullets');
    if (!skills.escalation.evalEscalation.length) contentErrors.push('escalation/SKILL.md has no `## Eval scenarios -- escalation` bullets');
  }
  if (skills.guardrails) {
    if (!skills.guardrails.forbiddenTopics.length) contentErrors.push('guardrails/SKILL.md has no `## Forbidden topics` bullets');
    if (!skills.guardrails.evalTraps.length) contentErrors.push('guardrails/SKILL.md has no `## Eval scenarios -- traps` bullets');
  }

  for (const skillId of allSkillIds) {
    if (BASELINE_SKILLS.includes(skillId)) continue;
    const skill = skills[skillId];
    if (!skill) continue;
    if (!skill.procedure || skill.procedure.trim().length < 50) {
      contentErrors.push(`${skillId}/SKILL.md has insufficient procedure content (need at least a ## Procedure section)`);
    }
  }

  report(scope, contentErrors);
}

// ---- structures-never-values lint (whole tree) ---------------------------

let mdFiles = [];
try {
  statSync(INDUSTRIES_DIR);
  mdFiles = walk(INDUSTRIES_DIR);
} catch {
  // industries dir doesn't exist
}
for (const filePath of mdFiles) {
  const content = readFileSync(filePath, 'utf8');
  const lintErrors = lintStructuresNeverValues(filePath, content);
  report(filePath.slice(ROOT.length), lintErrors);
}

// ---- result ----------------------------------------------------------

if (errorCount > 0) {
  console.error(`\n${errorCount} validation error(s). See SPEC.md for the package contract.`);
  process.exit(1);
}

const totalSkills = industryIds.reduce((sum, id) => sum + listSkillIds(id).length, 0);
console.log(
  `\u2713 ${industryIds.length} industr${industryIds.length === 1 ? 'y' : 'ies'}, ${totalSkills} total skills \u2014 all valid.`
);
