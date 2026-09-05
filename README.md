# ModelAtlas

A lightweight web app for recommending the best AI model for a user's specific task and constraints.

## Purpose

This project is intentionally small and practical. It is designed to help a user answer one question:

Which AI model is the best fit for my task, under my constraints?

## Current capabilities

- task-specific questionnaire for writing, coding, research, summarization, general assistance, and extraction
- curated model shortlist backed by benchmark metadata and source links
- weighted recommendations using task fit, quality, cost, speed, context, reliability, and privacy
- hard privacy eligibility filtering when privacy is required
- multimodal, structured-output, and deployment preferences
- ranked recommendations with budget, speed, fallback, and premium alternatives
- top-match score breakdown and comparison tables
- benchmark snapshot date, source confidence, version, and pricing metadata
- saved questionnaire answers using local storage
- copy recommendation and JSON export actions
- keyboard focus states, tab semantics, live result updates, and reduced-motion support

## Project structure

- index.html — app shell and form layout
- styles.css — responsive UI styling and accessibility states
- src/data/models.js — model metadata and scoring inputs
- src/logic/scoring.js — recommendation logic
- app.js — form handling and rendering
- docs/mvp.md — product and engineering notes
- tests/scoring.test.js — scoring and data contract tests

## Run locally

From the project root, install dependencies and start the local server:

npm install
npm start

Then open:

http://localhost:8000

Run the test suite with:

npm test

## Data notes

Model data is a curated benchmark snapshot, not a live provider feed. Scores and pricing should be reviewed when providers release new model versions or change pricing. The app displays benchmark dates, versions, confidence levels, and source links to make that limitation visible.

## Project status

ModelAtlas is an explainable recommendation MVP. It is designed to help compare model fit for a workflow, not to replace provider documentation, security review, or production benchmarking.
