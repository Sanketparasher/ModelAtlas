# ModelAtlas MVP Notes

## Goal

Help a user choose the right AI model for a task and set of constraints.

## Scope

- small questionnaire
- curated model shortlist
- transparent score-based recommendation
- result page with alternatives and explanation

## Data model

Each model should contain:

- id
- name
- task fit by task type
- quality score
- cost score
- speed score
- context score
- reliability score
- privacy score

## Recommendation flow

1. User answers task and constraints
2. System calculates weighted score for each model
3. System selects a primary recommendation and alternatives
4. System shows a short explanation

## Current capabilities

- benchmark snapshot freshness metadata
- hard privacy eligibility filtering
- score contribution breakdown for the top matches
- multimodal, structured-output, and deployment preferences
- saved answers, copy-to-clipboard, and JSON export
- keyboard focus states and reduced-motion support

## Future iterations

- add more model entries
- add a maintained benchmark ingestion pipeline
- support user accounts
- add compare-mode view
- expand explanation depth

## Design principle

Keep the system explainable and easy to adjust.
