// Loads the full catalog (industries and their skills) from disk into plain
// JS objects. Shared by eng/validate.js and eng/build.js so there is exactly
// one place that knows the on-disk skill shape.

import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  extractBlockquote,
  extractParagraph,
  extractSectionBullets,
  readFrontmatterFile
} from './parse.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));

export const INDUSTRIES_DIR = join(ROOT, 'industries');

/**
 * The four baseline skills every industry must have. Additional
 * problem-solving skills are discovered dynamically from disk.
 */
export const BASELINE_SKILLS = ['core', 'behavior', 'escalation', 'guardrails'];

function listDirs(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

export function listIndustryIds() {
  return listDirs(INDUSTRIES_DIR);
}

export function listSkillIds(industryId) {
  return listDirs(join(INDUSTRIES_DIR, industryId));
}

export function loadSkill(industryId, skillName) {
  const skillPath = join(INDUSTRIES_DIR, industryId, skillName, 'SKILL.md');
  if (!existsSync(skillPath)) {
    return { name: skillName, missing: true };
  }
  const { data, body } = readFrontmatterFile(skillPath);
  return { ...data, body };
}

function parseCore(skill) {
  const { body } = skill;
  return {
    name: skill.name,
    description: skill.description,
    type: 'core',
    baselineTone: extractSectionBullets(body, 'Baseline tone'),
    fallback: extractBlockquote(body, 'Fallback'),
    commonTopics: extractSectionBullets(body, 'Common topics'),
    domainTerms: extractParagraph(body, 'Domain terms'),
    exampleBusinessTypes: extractParagraph(body, 'Example business types')
  };
}

function parseBehavior(skill) {
  const { body } = skill;
  return {
    name: skill.name,
    description: skill.description,
    type: 'behavior',
    rules: extractSectionBullets(body, 'Rules'),
    evalCommon: extractSectionBullets(body, 'Eval scenarios -- common'),
    evalEdge: extractSectionBullets(body, 'Eval scenarios -- edge')
  };
}

function parseEscalation(skill) {
  const { body } = skill;
  return {
    name: skill.name,
    description: skill.description,
    type: 'escalation',
    triggers: extractSectionBullets(body, 'Triggers'),
    evalEscalation: extractSectionBullets(body, 'Eval scenarios -- escalation')
  };
}

function parseGuardrails(skill) {
  const { body } = skill;
  return {
    name: skill.name,
    description: skill.description,
    type: 'guardrails',
    forbiddenTopics: extractSectionBullets(body, 'Forbidden topics'),
    evalTraps: extractSectionBullets(body, 'Eval scenarios -- traps')
  };
}

/**
 * Generic parser for problem-solving skills (anything beyond the four
 * baseline skills). Extracts the full body, any `## Procedure` subsections,
 * and `## What not to do` bullets.
 */
function parseProblemSolving(skill, skillId) {
  const { body } = skill;
  return {
    name: skill.name,
    description: skill.description,
    type: 'problem-solving',
    id: skillId,
    whenToUse: extractParagraph(body, 'When to use'),
    procedure: body,
    doNot: extractSectionBullets(body, 'What not to do')
  };
}

const BASELINE_PARSERS = {
  core: parseCore,
  behavior: parseBehavior,
  escalation: parseEscalation,
  guardrails: parseGuardrails
};

export function loadIndustry(id) {
  const missing = [];
  const skills = {};

  for (const skillName of BASELINE_SKILLS) {
    const raw = loadSkill(id, skillName);
    if (raw.missing) {
      missing.push(`${skillName}/SKILL.md`);
      continue;
    }
    skills[skillName] = BASELINE_PARSERS[skillName](raw);
  }

  const allSkillIds = listSkillIds(id);
  for (const skillId of allSkillIds) {
    if (BASELINE_SKILLS.includes(skillId)) continue;
    const raw = loadSkill(id, skillId);
    if (raw.missing) continue;
    skills[skillId] = parseProblemSolving(raw, skillId);
  }

  return {
    id,
    skills,
    missing: missing.length ? missing : undefined
  };
}

export function loadCatalog() {
  const industries = Object.fromEntries(
    listIndustryIds().map((id) => [id, loadIndustry(id)])
  );
  return { industries };
}
