# Contributing

Thanks for your interest in contributing to var-th!

## Getting started

```bash
git clone https://github.com/kirilinsky/varth
cd varth
npm install
```

## Development

```bash
npm run dev           # watch mode
npm test              # run tests
npm run build         # build
npm run test:coverage # check coverage
```

## Before opening a PR

- tests pass — `npm test`
- types check — `npm run typecheck`
- new functionality has tests — coverage is tracked via Codecov and PRs without tests will not be merged

## Coverage

We use [Codecov](https://codecov.io/github/kirilinsky/varth) to track test coverage. Every new feature or bug fix must come with tests. Check your coverage locally before opening a PR:

```bash
npm run test:coverage
```

## Project structure

```
src/
├── index.ts          # core — defineThemes()
├── types.ts          # shared types
├── constants/        # constants
└── react/            # React provider + useTheme
```

## Adding a new framework

React implementation in `src/react/` can serve as a reference.
New framework entrypoints go in `src/{framework}/index.tsx`. Looking for help with Vue and Svelte integrations.
Don't forget to add the entrypoint to `tsdown.config.ts` and `exports` in `package.json`.

## Issues & discussion

Found a bug or have an idea — open an issue first before starting a big PR.
