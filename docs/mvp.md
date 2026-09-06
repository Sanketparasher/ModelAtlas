# ModelAtlas MVP Notes

## Goal

Help a user choose the right AI model for a task and set of constraints.

## Scope

- small questionnaire
- live-source model catalog
- transparent score-based recommendation
- result page with alternatives and explanation

## Data model

Each model should contain:

- id
- name
- normalized benchmark score by task type
- benchmark records with source provenance
- published pricing and context metadata when available

## Recommendation flow

1. User answers task and constraints
2. System calculates a benchmark-led weighted score for each model
3. System selects a primary recommendation and alternatives
4. System shows a short explanation

## Current capabilities

- benchmark snapshot freshness metadata
- explicit handling for unavailable benchmark dimensions
- score contribution breakdown for the top matches
- multimodal, structured-output, and deployment preferences
- saved answers, copy-to-clipboard, and JSON export
- keyboard focus states and reduced-motion support
- normalized benchmark records with source provenance and validation
- refresh script for LMSYS Chatbot Arena and official SWE-bench data

## Future iterations

- add more trusted benchmark sources for research, writing, and extraction
- support user accounts
- add compare-mode view
- expand explanation depth

## Design principle

Keep the system explainable and easy to adjust.
