# ModelAtlas MVP Notes

## Goal

Help a user choose the right AI model for their actual workflow, constraints, and budget.

## Target users

ModelAtlas is designed for:

- students and learners
- researchers and academics
- individual professionals
- freelancers and consultants
- small business owners
- business teams and departments
- enterprise users with compliance or governance needs

## Scope

- broader task selection and person-based recommendations
- benchmark-powered model comparison
- explainable scoring based on task fit and constraints
- lightweight static deployment for easy hosting
- recommendations with alternatives and tradeoff explanations

## Core recommendation flow

1. User selects their profile and workflow
2. System asks a few task-specific follow-up questions
3. System weights quality, speed, cost, privacy, and context
4. System recommends a best-fit model and a few alternatives
5. System explains the tradeoff in plain language

## Current capabilities

- persona-aware scoring for individual and business users
- broader workflow coverage beyond coding and general usage
- benchmark-proven recommendation engine
- saved answers and export features
- leaderboard page for comparison across models
- provenance metadata and benchmark validation
- static GitHub Pages hosting support

## Product direction

The product should feel useful to all types of AI users, not just developers. The next level is to make the recommendation flow feel personal and realistic:

- student needs: simpler explanations, lower cost, learning support
- researcher needs: source traceability, long context, reliable synthesis
- professional needs: polished output, speed, queue-friendly productivity
- business needs: privacy, team reliability, compliance readiness

## Design principle

Keep the app explainable, practical, and easy to adjust without adding unnecessary complexity.
