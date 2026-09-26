# ModelAtlas

ModelAtlas is a lightweight AI model recommender for students, researchers, freelancers, founders, teams, and enterprise users.

## Purpose

The app helps users answer one question quickly:

Which AI model is the best fit for my task, my constraints, and my budget?

Instead of treating every user the same, ModelAtlas personalizes the experience by role, workflow, and tradeoff preference. The latest version makes the experience feel lighter and more relevant by guiding users through a role-based onboarding flow before the detailed assessment begins.

## Core user experience

The current app includes:

- profession-based landing cards for different user types
- role-aware quick-start suggestions for solo professionals, freelancers, startups, teams, and enterprises
- a more polished premium landing experience with trust signals and stronger messaging
- a streamlined recommendation flow that reduces decision fatigue
- a results page with clear top alternatives, cost tradeoffs, use-case guidance, and explanation panels

## What the app covers

- students and learning workflows
- research and evidence review
- writing and content creation
- summarization and document review
- coding and debugging
- business operations and workflow support
- personal productivity and planning
- document extraction and structured analysis

## Current capabilities

- role-based onboarding and workflow suggestions
- broader task selection for different user groups
- user profile weighting for solo vs team vs business usage
- benchmark-led scoring with source provenance and pricing context
- ranked recommendations with budget, fast, fallback, and premium alternatives
- explanation panel showing why a model was chosen
- task-specific follow-up questions
- saved answers with local storage
- recommendation export and copy actions
- static GitHub Pages deployment support

## Recent improvements

- Added role selection cards to make the onboarding feel more relevant and less overwhelming
- Added dynamic role suggestions to help users start in the right workflow quickly
- Refined the hero section to emphasize trust, speed, and usefulness
- Expanded result cards to better communicate the strongest model, budget option, and fallback recommendation

## Project structure

- index.html — landing page, role selection, recommendation flow, and result view
- leaderboard.html — dedicated leaderboard page
- app.js — homepage form flow, onboarding interactions, and rendering
- leaderboard.js — leaderboard page rendering
- styles.css — styling and responsive UI
- src/data/models.js — model catalog entry point
- src/data/generated-models.js — generated benchmark snapshot
- src/data/benchmark-schema.js — data validation and provenance rules
- src/logic/scoring.js — recommendation logic and scoring
- tests/scoring.test.js — regression and scoring checks
- docs/mvp.md — product notes and roadmap
- scripts/update-benchmarks.js — refresh benchmark data
- scripts/validate-benchmarks.js — validate model catalog integrity

## Run locally

From the project root:

```bash
npm install
npm start
```

Then open:

```text
http://localhost:8000
```

Run the tests:

```bash
npm test
```

Validate the benchmark catalog:

```bash
npm run validate:benchmarks
```

Refresh the catalog from the public sources:

```bash
npm run update:benchmarks
```

## GitHub Pages

This project is a static site and is ready for GitHub Pages.

1. Push the repo to GitHub
2. Go to Settings → Pages
3. Set Source to Deploy from a branch
4. Choose Branch: main
5. Folder: /root
6. Save

The site will be available at:

```text
https://<your-username>.github.io/<repo-name>/
```

## Data notes

The catalog is generated from public benchmark sources and includes source metadata, benchmark versioning, and confidence indicators. It is meant to be explainable and practical rather than a replacement for provider documentation, security review, or internal evaluation.

## Status

ModelAtlas is a practical, benchmark-driven recommendation engine designed for real-world usage, broader public adoption, and simple static deployment. The latest iteration focuses on reducing friction through role-based onboarding and a more premium, user-friendly presentation.
