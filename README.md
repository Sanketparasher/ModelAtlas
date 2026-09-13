# ModelAtlas

ModelAtlas is a lightweight AI model recommender for students, researchers, professionals, freelancers, startups, and business teams.

## Purpose

The app helps users answer one question quickly:

Which AI model is the best fit for my task, my constraints, and my budget?

Instead of treating every user the same, ModelAtlas asks about:

- who is using the model
- what kind of work they do
- what matters most: speed, quality, cost, privacy, or context
- whether the workload is personal, academic, research, or business-focused

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

- broader task selection for different user groups
- user profile weighting for solo vs team vs business usage
- benchmark-led scoring with source provenance and pricing context
- ranked recommendations with budget, fast, fallback, and premium alternatives
- explanation panel showing why a model was chosen
- task-specific follow-up questions
- saved answers with local storage
- recommendation export and copy actions
- static GitHub Pages deployment support

## Project structure

- index.html — main recommendation page
- leaderboard.html — dedicated leaderboard page
- app.js — homepage form flow and rendering
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

ModelAtlas is an MVP designed for real-world model comparison, broader public use, and simple static deployment.
