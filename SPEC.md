# Skillz Package Spec

This document defines the **file and schema contract** for everything in this
repository. If your PR follows this spec, CI validation (`npm run validate`)
should pass and the catalog will build (`npm run build`).

> **Rule zero -- structures, never values.** Every file in `industries/**`
> teaches an agent how the *category* of business works (vocabulary,
> behavioral defaults, escalation triggers, guardrails). No file may contain
> a real company's policy, price, SLA, or promise as if it were fact.
> Examples and eval traps use invented placeholder businesses only.

---

## 1. Repository layout

```text
customer-support-skillz/
├── industries/
│   └── <industry-id>/            # one folder per industry
│       ├── core/SKILL.md         # baseline tone, vocabulary, domain terms
│       ├── behavior/SKILL.md     # behavioral rules + common/edge eval
│       ├── escalation/SKILL.md   # escalation triggers + escalation eval
│       └── guardrails/SKILL.md   # forbidden topics + trap eval
├── .schemas/                     # JSON Schema used by `npm run validate`
├── eng/                          # zero-dependency Node scripts (parse/validate/build)
└── dist/                         # generated on `npm run build` -- not committed
```

**One skill = one folder = one SKILL.md.** Each skill is self-contained.
No standalone files at the industry root; everything lives inside a
skill folder.

## 2. Industry packages (`industries/<industry-id>/`)

`<industry-id>` is lowercase-with-hyphens (e.g. `retail`, `digital-services`,
`wellness`, `hospitality`, `healthcare`).

Each industry has two tiers of skills:

### Baseline skills (required, exactly four)

These teach the agent *how to act* in this industry:

| Skill folder    | Required | Purpose                                               |
| --------------- | -------- | ----------------------------------------------------- |
| `core/`         | Yes      | Baseline tone, fallback message, vocabulary, domain terms, example business types |
| `behavior/`     | Yes      | Behavioral rules + common/edge eval scenarios         |
| `escalation/`   | Yes      | Escalation triggers + escalation eval scenarios       |
| `guardrails/`   | Yes      | Forbidden topics + false-premise trap eval scenarios  |

### Problem-solving skills (variable, at least one recommended)

These teach the agent *how to solve recurring problems* in this industry.
They are generic common sense for the niche, not tied to any specific
company. The agent uses these as structured frameworks and fills in the
specifics from the company's ingested knowledge base.

Examples by industry (core packs; not exhaustive forever):

| Retail | Digital Services | Wellness | Hospitality |
| --- | --- | --- | --- |
| `order-tracking/` | `login-access/` | `membership-management/` | `reservation-management/` |
| `returns-refunds/` | `subscription-billing/` | `booking-scheduling/` | `check-in-out/` |
| `shipping-issues/` | `bug-reports/` | `facility-issues/` | `room-issues/` |
| `payment-problems/` | `onboarding-setup/` | `billing-payments/` | `loyalty-rewards/` |
| `product-inquiries/` | `data-privacy/` | `late-cancel-no-show/` | `billing-folio/` |
| `order-changes-cancellations/` | `product-how-to/` | `class-packs-credits/` | `wifi-connectivity/` |
| `subscription-replenishment/` | `permissions-roles/` | `personal-training/` | `ota-third-party/` |
| `promotions-discounts/` | `integrations-api/` | `access-check-in/` | `accessibility-special-requests/` |
| `account-orders/` | `plan-limits-quotas/` | `freeze-medical-leave/` | `lost-found/` |
| `damaged-wrong-item/` | `performance-outages/` | `injury-incident/` | `travel-disruptions/` |
| | `course-enrollment-access/` | | `overbooking-relocation/` |
| | `cancellation-retention/` | | `service-recovery/` |

Problem-solving skills follow the same `folder/SKILL.md` pattern. Each
contains a `## When to use` trigger, a `## Procedure` with step-by-step
guidance, and a `## What not to do` guardrail section. The procedure
teaches the *structure* of handling the problem (what to gather, what to
look up, how to resolve) while deferring actual values (prices, policies,
timelines) to the company's knowledge base.

This is Layer 2: generic industry to specific business in that industry.

`eval` scenarios are **structures** (question shapes an agent must handle
correctly), not scoring engines. The scoring/adversarial engines that grade
an agent's answers live in downstream, closed-source repos.

## 3. SKILL.md frontmatter

Every `SKILL.md` uses the same minimal frontmatter:

```yaml
---
name: retail-core
description: 'One sentence, wrapped in single quotes, 10-300 characters'
---
```

Required keys: `name`, `description`.

`name` must be lowercase-with-hyphens and typically follows the pattern
`<industry>-<skill>` (e.g. `retail-behavior`, `wellness-escalation`).

## 4. Skill content sections

### core/SKILL.md

| Section                       | Format     | Required |
| ----------------------------- | ---------- | -------- |
| `## Baseline tone`            | Bullets    | Yes      |
| `## Fallback`                 | Blockquote | Yes      |
| `## Common topics`            | Bullets    | Yes      |
| `## Domain terms`             | Paragraph  | Yes      |
| `## Example business types`   | Paragraph  | No       |

The core skill provides a **generic, professional, caring** agent baseline for
the industry. It does not encode proprietary persona dimensions (character,
verbosity, formality, emoji mode, opener style, etc.). Those are private to
downstream runtimes that consume this catalog.

### behavior/SKILL.md

| Section                         | Format  | Required |
| ------------------------------- | ------- | -------- |
| `## Rules`                      | Bullets | Yes      |
| `## Eval scenarios -- common`   | Bullets | Yes      |
| `## Eval scenarios -- edge`     | Bullets | Yes      |

### escalation/SKILL.md

| Section                             | Format  | Required |
| ----------------------------------- | ------- | -------- |
| `## Triggers`                       | Bullets | Yes      |
| `## Eval scenarios -- escalation`   | Bullets | Yes      |

### guardrails/SKILL.md

| Section                        | Format  | Required |
| ------------------------------ | ------- | -------- |
| `## Forbidden topics`          | Bullets | Yes      |
| `## Eval scenarios -- traps`   | Bullets | Yes      |

## 5. Validation (`npm run validate`)

`eng/validate.js` checks, per industry:

1. All four required skill folders exist with a `SKILL.md` inside.
2. Frontmatter matches `.schemas/skill.schema.json`.
3. Every required section listed in section 4 is non-empty.
4. **Structures-never-values lint** -- flags common value leaks: absolute
   prices (`$\d`), hardcoded contact emails/phone numbers. Guardrails eval
   traps are exempt (false premises are expected content there).

CI (`.github/workflows/ci.yml`) runs `npm run validate` and `npm run build`
on every PR.

## 6. Build output (`npm run build`)

`eng/build.js` parses every industry into:

- `dist/catalog.json` -- one JSON document, industry-id keyed
- `dist/index.js` + `dist/index.d.ts` -- a small typed accessor API
  (`getIndustry(id)`, `listIndustries()`, `listIndustryIds()`,
  `SKILLZ_VERSION`)

Consumers (like Humaner's private runtime) depend on this package and adapt
`dist/catalog.json` into their own internal types. The build output is never
committed; it is generated by consumers or in CI.

## 7. Adding a new industry

See `CONTRIBUTING.md` for the step-by-step guide. In short: copy
`industries/retail/` as a template, rewrite every skill's `SKILL.md` for the
new industry, run `npm run validate`, and open a PR.
