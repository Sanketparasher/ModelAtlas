# ModelAtlas

A lightweight web app for recommending the best AI model for a user's specific task and constraints.

## Purpose

This project is intentionally small and practical. It is designed to help a user answer one question:

Which AI model is the best fit for my task, under my constraints?

## Current capabilities

- task-specific questionnaire for coding and general assistance
- live benchmark catalog fetched from LMSYS Chatbot Arena and the official SWE-bench leaderboard
- benchmark-led recommendations using published benchmark scores and pricing where available
- explicit provenance, retrieval dates, benchmark dates, and confidence metadata
- multimodal, structured-output, and deployment preferences
- ranked recommendations with budget, speed, fallback, and premium alternatives
- top-match score breakdown and comparison tables
- benchmark snapshot date, source confidence, version, source URLs, and pricing metadata
- saved questionnaire answers using local storage
- copy recommendation and JSON export actions
- keyboard focus states, tab semantics, live result updates, and reduced-motion support

## Project structure

- index.html — app shell and form layout
- styles.css — responsive UI styling and accessibility states
- src/data/models.js — generated benchmark catalog entry point
- src/data/generated-models.js — generated live-source snapshot; do not edit manually
- src/logic/scoring.js — recommendation logic
- app.js — form handling and rendering
- docs/mvp.md — product and engineering notes
- tests/scoring.test.js — scoring and data contract tests
- src/data/benchmark-schema.js — normalized benchmark schema and provenance validation
- scripts/validate-benchmarks.js — benchmark catalog validation command
- scripts/update-benchmarks.js — fetches and normalizes trusted online leaderboards

## Run locally

From the project root, install dependencies and start the local server:

npm install
npm start

Then open:

http://localhost:8000

Run the test suite with:

npm test

Validate the benchmark catalog with:

npm run validate:benchmarks

Refresh the catalog from the online sources with:

npm run update:benchmarks

## Data notes

The catalog is generated from public leaderboard data. Coding scores come from SWE-bench Verified and general scores come from LMSYS Chatbot Arena. The app does not invent scores for unsupported tasks; refresh the catalog with `npm run update:benchmarks` before using newer source data.

## Project status

ModelAtlas is an explainable recommendation MVP. It is designed to help compare model fit for a workflow, not to replace provider documentation, security review, or production benchmarking.
