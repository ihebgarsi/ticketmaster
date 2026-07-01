---
name: react-doctor
description: Use when finishing a feature, fixing a bug, before committing React code, or when the user types /doctor, asks to scan, triage, or clean up React diagnostics. Covers lint, accessibility, bundle size, architecture. Includes a regression check and a full local-triage workflow that fetches the canonical playbook.
version: "1.2.0"
---

# React Doctor

Scans React codebases for security, performance, correctness, and architecture issues. Outputs a 0–100 health score.

This repo's React app lives in `frontend/`. Run React Doctor from that directory.

## After making React code changes:

```bash
cd frontend
npm run doctor:diff
```

Check the score did not regress. If it dropped, fix regressions before committing.

## For general cleanup or code improvement:

```bash
cd frontend
npm run doctor:verbose
```

Fix issues by severity — errors first, then warnings.

## /doctor — full local triage workflow

When the user types `/doctor`, says "run react doctor", or asks for a full triage / cleanup pass, fetch the canonical local-triage playbook:

```bash
curl --fail --silent --show-error \
  --header 'Cache-Control: no-cache' \
  https://www.react.doctor/prompts/react-doctor-agent.md
```

Pair it with per-rule prompts at `https://www.react.doctor/prompts/rules/<plugin>/<rule>.md`.

## Configuring or explaining rules

Read `frontend/.agents/skills/react-doctor/references/explain.md` or run:

```bash
cd frontend
npx react-doctor@latest rules explain <rule>
```

## Command reference

| Script | Purpose |
| ------ | ------- |
| `npm run doctor` | Full scan |
| `npm run doctor:verbose` | Full scan with file/line details |
| `npm run doctor:diff` | Scan only changed files vs base branch |
