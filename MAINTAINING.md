# Maintaining customer-support-skillz

How we run the **public** catalog repo
([Humaner-inc/customer-support-skillz](https://github.com/Humaner-inc/customer-support-skillz)):
branching, forks, PR review, and what lands on `master`.

Contributor-facing steps live in [`CONTRIBUTING.md`](./CONTRIBUTING.md).
This doc is for **maintainers**.

---

## Branch model (chosen)

```text
contributor fork (from master)
        │
        │  PR (skills / industries / docs)
        ▼
   contributions     ◄── community PRs land here
        │                 you review + merge into contributions
        │
        │  maintainer-only PR when ready
        ▼
      master         ◄── protected; consumers pin this
                         (Humaner: #master)
```

| Branch | Who merges | Purpose |
| --- | --- | --- |
| **`contributions`** | Maintainers merge **community PRs** here after review | Integration / staging catalog |
| **`master`** | Maintainers only (promote from `contributions`) | Stable catalog for consumers |

**What this solves:** nobody outside Humaner-inc can publish straight into
`master`. Community work accumulates on `contributions`; you decide when it
is good enough to promote.

**Fork source:** people still **fork from `master`** (default / stable).
They open a feature branch on *their fork*, then open a PR **targeting
`contributions`**, not `master`.

---

## Setup (one-time on GitHub)

### 1. Create the staging branch

```bash
git checkout master
git pull origin master
git checkout -b contributions
git push -u origin contributions
```

### 2. Protect `master`

Settings → Branches → Branch protection rule for `master`:

- Require a pull request before merging
- Require status checks to pass (CI `validate`)
- Require approvals (at least 1) — optional but recommended
- Restrict who can push / merge (Humaner-inc maintainers only)
- Do **not** allow force pushes

Result: even maintainers normally go through a PR; the community cannot
land commits on `master` at all.

### 3. Protect `contributions` (lighter)

Settings → Branches → rule for `contributions`:

- Require a pull request before merging
- Require status checks (same CI)
- Allow maintainers to merge community PRs after review
- Optionally allow admin bypass for hotfixes on staging only

### 4. Point contributors at the right base

- Default branch for the repo stays **`master`** (what forks clone).
- In CONTRIBUTING / PR template: **open PRs against `contributions`**.
- Optional: GitHub Settings → General → “Default branch for PRs” if available,
  or a PR template that sets the base to `contributions`.

---

## Contributor path

1. Fork the repo (from `master`).
2. Create a feature branch on the fork (`add-healthcare`, …).
3. Open a PR: **base = `contributions`**, compare = their branch.
4. CI must pass (`npm run validate` + `npm run build`).
5. Maintainer reviews and merges into `contributions`.

They never need write access to `master`.

---

## Maintainer path: promote to `master`

When `contributions` looks good (CI green, content reviewed):

```bash
git checkout master
git pull origin master
git checkout -b promote/contributions-$(date +%Y%m%d)
git merge origin/contributions   # or open a GitHub PR contributions → master
git push -u origin HEAD
gh pr create --base master --head promote/contributions-YYYYMMDD \
  --title "Promote contributions → master" \
  --body "Staging catalog ready for consumers."
```

Or on GitHub: **New PR** → base `master` ← compare `contributions`.

After merge:

- Consumers on `#master` (e.g. Humaner) pick up changes on the next lockfile
  update / install.
- `contributions` stays open for the next batch of community PRs.

Keep `contributions` regularly merged *from* `master` if you ever hotfix
`master` directly, so staging does not drift:

```bash
git checkout contributions
git merge origin/master
git push origin contributions
```

---

## Maintainer checklist for community PRs (`→ contributions`)

### Automated (CI)

- [ ] `npm run validate` passes
- [ ] `npm run build` passes
- [ ] `dist/` is **not** committed

### Content

- [ ] Matches [`SPEC.md`](./SPEC.md)
- [ ] Structures, never values
- [ ] No proprietary persona dimensions
- [ ] Problem-solving skills defer to the knowledge base
- [ ] Focused PR (one industry or one skill theme when practical)

### Merge

- [ ] Merge into **`contributions`**, not `master`
- [ ] Promote `contributions` → `master` in a separate, intentional step

---

## Humaner / consumers

Pin stays on stable:

```json
"@humaner/customer-support-skillz": "github:Humaner-inc/customer-support-skillz#master"
```

Or after npm publish:

```json
"@humaner/customer-support-skillz": "^0.2.0"
```

Do **not** pin Humaner to `#contributions` unless you intentionally want
staging skillz in the product.

After a promote to `master`:

```bash
pnpm update @humaner/customer-support-skillz --filter @humaner/dashboard
# commit the lockfile bump
```

---

## Why not “everyone PRs into master”?

You *can* lock `master` with branch protection and still take PRs into
`master` (maintainer merge only). That also blocks “everyone publishing to
master.”

The **`contributions` staging branch** adds an extra buffer:

- Community merges do not move the consumer pin immediately
- You batch-review / smoke-test before Humaner sees new skillz
- Hotfixes on `master` stay possible without fighting open community PRs

Use staging if you want that control. Branch protection alone is the
minimum; staging is the chosen policy for this repo.

---

## Anti-patterns

| Avoid | Why |
| --- | --- |
| Letting community PRs target `master` | Bypasses the staging buffer you want |
| Making `contributions` the default branch people fork from | Forks should start from stable `master` |
| Pinning Humaner to `#contributions` | Ships unreviewed staging into product |
| Committing `dist/` | Built on install via `prepare` |
| Direct pushes to `master` without a promote PR | Skips the intentional gate |

---

## Decision log (July 2026)

- Public repo: [Humaner-inc/customer-support-skillz](https://github.com/Humaner-inc/customer-support-skillz)
- Default / fork source: **`master`**
- Community PR target: **`contributions`**
- Promote: maintainer PR **`contributions` → `master`**
- Consumer pin: Humaner **`#master`**
