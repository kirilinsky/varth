# Contributing

Thanks for your interest in contributing to var-th!

var-th is a **CLI** (`npx varth init|gen`) that compiles a theme config into modern CSS plus a tiny generated theme switcher. The package ships no runtime API — everything under `src/` except `cli.ts` is an internal engine.

## Requirements

- Node ≥ 22.18 — the CLI loads `varth.config.ts` via native type stripping, and CI runs on this floor.

## Getting started

```bash
git clone https://github.com/kirilinsky/varth
cd varth
npm install
```

## Development

```bash
npm test              # run tests
npm run test:coverage # tests + coverage report
npm run typecheck     # tsc --noEmit
npm run build         # build dist/cli.mjs
npm run dev           # build in watch mode
npm run demo          # interactive playground (vite)
```

Try your CLI changes end-to-end:

```bash
npm run build
cd "$(mktemp -d)" && node <path-to-repo>/bin/varth.mjs init
```

## Before opening a PR

- tests pass — `npm test`
- types check — `npm run typecheck`
- new functionality has tests — coverage is tracked via [Codecov](https://codecov.io/github/kirilinsky/varth) and PRs without tests will not be merged

CI runs the same steps on every PR (typecheck → tests+coverage → build → real `init`/`gen` smoke in a temp dir), so a green local run means a green PR.

## Project structure

```
bin/
└── varth.mjs         # bin entry: shebang wrapper → dist/cli.mjs
src/
├── cli.ts            # the product: init / gen / gen --watch, output formatting
├── index.ts          # internal engine — defineThemes()
├── css.ts            # CSS emission (light-dark / attribute / @property)
├── color.ts          # color detection + oklch ramps
├── types.ts          # config types (VarthConfig etc)
└── constants/        # constants
demo/                 # vite playground (imports src/ directly to render
                      # the same output the CLI writes to disk)
```

Notes that save review rounds:

- `src/cli.ts` must stay dependency-free (node builtins only) and must **not** contain a shebang — the shebang lives in `bin/varth.mjs`, and a shebang in `src/` breaks the vite transform in tests.
- CLI tests run in a node environment (`// @vitest-environment node` pragma); core tests use happy-dom.
- Generated-file changes (`varth.css` / `varth.js` / `varth.d.ts` shape) should update the README examples and `demo/` panes in the same PR.

## Releasing (maintainers)

```bash
npm run release   # npm version patch + push --follow-tags
```

The `publish` workflow builds, tests and publishes to npm with provenance on every `v*` tag. Requires the `NPM_TOKEN` repo secret.

## Issues & discussion

Found a bug or have an idea — open an issue first before starting a big PR.
