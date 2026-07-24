# AGENTS.md

## Project overview

`@humaner/customer-support-skillz` is a community-contributable catalog of
customer-support industry skills. It is plain markdown + JSON Schema + a
zero-dependency Node build -- no frameworks, no secrets, nothing to run
except `npm run validate` / `npm run build`.

## Repository structure

```text
.
├── industries/<name>/             # one folder per industry
│   ├── core/SKILL.md              # baseline tone, vocabulary, domain terms
│   ├── behavior/SKILL.md          # behavioral rules + common/edge eval
│   ├── escalation/SKILL.md        # escalation triggers + escalation eval
│   └── guardrails/SKILL.md        # forbidden topics + trap eval
├── .schemas/                      # JSON Schema for SKILL.md frontmatter
├── eng/                           # parse.js / validate.js / build.js (zero deps)
├── SPEC.md                        # the package schema -- read this first
└── CONTRIBUTING.md                # human contribution guide
```

**One skill = one folder = one SKILL.md.** Each industry has exactly four
skills: core, behavior, escalation, guardrails.

## Setup commands

```bash
npm install
npm run validate   # schema + required-sections + structures-never-values lint
npm run build      # writes dist/catalog.json + dist/index.js
```

There is no test suite beyond `validate` + `build` -- a clean run of both is
the bar for "this change is safe to merge."

## Working with industry skills

Read [`SPEC.md`](./SPEC.md) in full before adding or editing a package. The
single most important rule in this repo:

> **Structures, never values.** Files teach an agent how a *category* of
> business reasons (vocabulary, behavioral defaults, escalation shape,
> guardrails). Never assert a real policy, price, date, or promise as fact
> outside of `guardrails/SKILL.md`'s eval traps section, where it must be
> framed as a false premise a customer might raise.

When adding a new industry:

1. Copy `industries/retail/` as a template
2. Rewrite every skill's `SKILL.md` for the new industry
3. Keep eval scenario lists to realistic, varied examples (6-10 per section
   minimum) -- these are scenario structures, not scoring logic
4. Run `npm run validate` and fix every reported issue before opening a PR
5. Run `npm run build` to confirm the catalog still compiles

## Validation rules agents must satisfy

- `SKILL.md` frontmatter must match `.schemas/skill.schema.json` exactly
  (required keys: `name`, `description`)
- Every required section in `SPEC.md` section 4 must exist and be non-empty
- No absolute prices (`$\d`), hardcoded contact info anywhere except
  guardrails eval traps
- Folder and file names: lowercase-with-hyphens

## Pull request guidelines

- Target the `main` branch
- Title should describe the concrete addition ("Add healthcare industry
  package", not "Update skills")
- Run `npm run validate && npm run build` before opening the PR and mention
  the result in the PR description
- Keep one industry per PR when practical, to keep review scoped

## Do not

- Do not add engine code (retrieval, scoring, adversarial testing, desk
  routing) here | this repo is structures only.
- Do not reference or encode any specific real business's actual policy.
- Do not add dependencies to `eng/` scripts without discussing in the PR | they are intentionally zero-dependency.
