# ModelAtlas

A lightweight web app for recommending the best AI model for a user's specific task and constraints.

## Purpose

This project is intentionally small and practical. It is designed to help a user answer one question:

Which AI model is the best fit for my task, under my constraints?

## MVP direction

- small questionnaire
- curated model shortlist
- simple scoring logic
- ranked recommendations with alternatives
- no full benchmark platform in the first version

## Project structure

- index.html — app shell and form layout
- styles.css — minimal UI styling
- src/data/models.js — model metadata and scoring inputs
- src/logic/scoring.js — recommendation logic
- app.js — form handling and rendering
- docs/mvp.md — product and engineering notes

## Run locally

From the project root:

python -m http.server 8000

Then open:

http://localhost:8000
