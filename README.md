# Sprintest

A free, AI-native QA course delivered as an **installable agent skill**. No
website, no API, no connector setup: the whole course — 23 modules from core
manual QA to Playwright automation — lives in this repository, and any AI
agent that can read files can teach it.

## Install

In any agent with a terminal (Claude Code, Cursor, Codex, …):

```bash
npx skills add shatxlab/sprintest
```

Then open a new chat and say: **"Teach me QA — use the Sprintest skill."**

For chat-only clients (ChatGPT/Claude projects): download the repository as a
ZIP, unpack it, and attach the folder (or at minimum `SKILL.md` +
`content/course/`) to your project — then start the same way.

## What the skill contains

- `SKILL.md` — the tutor contract: file map, language rule, non-negotiables
- `content/course/manifest.json` — the ordered module list (the course itself)
- `content/course/agent-guide.{en,ru}.md` — full teaching instructions for the agent
- `content/course/modules/<slug>/` — lesson content (EN/RU) + practice tasks with
  tutor instructions (review criteria, hint progressions, planted defects for
  simulated systems — the agent uses them to guide and review, and is instructed
  never to reveal them before the learner commits their own work)
- `content/course/glossary/`, `pillars.json`, `tracks/qa.json`

The course is bilingual (English + Russian) and follows the learner's language.
It ends with a final interview; the completion artifact is issued only after a
pass.

## For agents and contributors

- `npx vitest run` — content-integrity gates (21 tests)
- `npx tsc --noEmit` — typecheck

License: MIT — use it freely.
