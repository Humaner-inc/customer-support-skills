# Contributing to customer-support-skillz

Thanks for helping grow the open customer-support how-to catalog! This repo
accepts contributions from humans and AI agents alike (see
[`AGENTS.md`](./AGENTS.md) for agent-specific conventions).

## Table of contents

- [What we accept](#what-we-accept)
- [What we don't accept](#what-we-dont-accept)
- [Adding an industry](#adding-an-industry)
- [Editing an existing industry](#editing-an-existing-industry)
- [Validating your changes](#validating-your-changes)
- [Submitting your contribution](#submitting-your-contribution)

## What we accept

- New industry packages (`industries/<name>/`) following [`SPEC.md`](./SPEC.md)
- Improvements to existing packages: better vocabulary coverage, more
  realistic edge cases, sharper escalation triggers, clearer guardrails
- Tooling improvements under `eng/` (parser, validator, build)
- Documentation fixes

## What we don't accept

- **Real company policies as fact.** Every value (a price, a return window, a
  cancellation fee) must stay in `guardrails/SKILL.md` under
  `## Eval scenarios -- traps` as a *false premise the customer might raise*,
  never asserted as true elsewhere in the package.
- **Persona preset dimensions** (character, verbosity, formality, emoji mode,
  etc.) -- these are private to downstream runtimes. The `core/SKILL.md`
  provides a generic professional caring baseline only.
- **Legal, medical, or clinical advice content** presented as something the
  agent should give -- guardrail and behavior files should tell the agent to
  *redirect*, not supply the advice.
- Content that encodes a real, identifiable business's internal policy,
  contact information, or proprietary process.
- Duplicate industries that don't meaningfully differ in vocabulary,
  escalation, or guardrail shape from an existing package.

## Adding an industry

1. Copy an existing package as a template:

   ```bash
   cp -r industries/retail industries/healthcare
   ```

2. Rewrite every skill's `SKILL.md` for the new industry:

   - `core/SKILL.md` -- baseline tone, fallback message, vocabulary, domain
     terms, and example business types for the new industry. Keep the tone
     generic: professional, caring, no em-dashes.
   - `behavior/SKILL.md` -- behavioral rules and at least 10 common + 10
     edge-case eval scenarios.
   - `escalation/SKILL.md` -- escalation triggers and at least 6 escalation
     eval scenarios.
   - `guardrails/SKILL.md` -- forbidden topics and at least 6 false-premise
     trap eval scenarios.

3. Update each `SKILL.md` frontmatter: `name` and `description`.

4. Run validation:

   ```bash
   npm run validate
   ```

5. Open a PR. Exit bar: **a reviewer with no prior context on this industry
   should be able to read your four skills and understand how a support agent
   should behave in it.**

## Editing an existing industry

- Keep changes focused: one skill per commit when practical.
- Don't rewrite content that's already correct just to match your style.
- Run `npm run validate` before pushing.

## Validating your changes

```bash
npm install
npm run validate   # schema + required-sections + structures-never-values lint
npm run build      # confirms the catalog still compiles to dist/
```

Both must pass before requesting review.

## Submitting your contribution

1. Fork this repository (from **`master`**, the default / stable branch)
2. Create a feature branch on **your fork** (e.g. `add-healthcare`)
3. Make your changes following the guides above
4. Run `npm run validate && npm run build`
5. Open a pull request with **base = `contributions`** (not `master`) with:
   - A clear title (e.g. "Add healthcare industry package")
   - Which skills you added/changed and why
   - Confirmation that `npm run validate` passes

Maintainers review on `contributions`, then promote to `master` when ready.
See [`MAINTAINING.md`](./MAINTAINING.md).

## Code of conduct

Be respectful, be specific, and keep contributions focused on helping support
agents reason well about a category of business -- not on any single real
company.

## License

By contributing, you agree your contribution is licensed under the MIT
License (see [`LICENSE`](./LICENSE)).
