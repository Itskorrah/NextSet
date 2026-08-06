# Project charter

**Status:** Foundation proposal for product-owner approval  
**Date:** 6 August 2026  
**Product:** NextSet  
**Current phase:** Product foundation, design exploration, and system design

## Mission

NextSet makes planning, starting, recording, and progressing through workouts easier. It gives people the right amount of information at the right time without getting in the way of training.

## Why this product should exist

Workout apps often force users to choose between speed and control: simple loggers become rigid as training evolves, while powerful programme tools expose too much configuration during the workout itself. NextSet’s opportunity is to make repeated logging reliably fast while keeping scheduling, programme rules, substitutions, and progression understandable and user-controlled.

## Outcomes for this milestone

This milestone must give the product owner enough evidence to decide:

1. Whether the central product promise and target audience are correct.
2. Whether the proposed MVP is substantial but disciplined.
3. Which of three distinct visual/product directions should anchor the design system.
4. Whether the mobile and local-first architecture is acceptable.
5. Whether the critical journeys and workout rules are implementable, safe, and testable.

## In scope

- Current competitor, user-problem, interaction, non-fitness, technology, tooling, accessibility, font/licence, and preliminary name-collision research
- Product requirements, prioritisation, success measures, and explicit exclusions
- Workout, programme, progression, set, scheduling, restoration, and safety rule specifications
- Complete critical user journeys and information architecture
- Three high-fidelity, disposable visual direction prototypes
- Mobile stack, system boundary, local-first data, offline, future sync, privacy, and security decisions
- Testing, accessibility, performance, and release-readiness gates
- Multi-agent operating model, repository constitution, governance templates, and reusable Codex workflows

## Out of scope

- Production mobile application or backend
- Account system, live cloud sync, subscriptions, payments, public social feed, nutrition, marketplace, autonomous coaching, or wearable app
- Medical, rehabilitation, diagnosis, injury, or professional coaching claims
- Trademark or legal clearance for the name NextSet

## Constraints

- Workout data must remain safe without connectivity, app continuity, or a working server.
- The default product must work for mainstream gym users and multiple programme structures.
- Recommendations must be optional, deterministic where possible, and explain their inputs.
- Accessibility and data safety may not be traded away for visual novelty or velocity.
- No production implementation begins before explicit product-owner approval.

## Success for this milestone

- Required research claims are sourced, dated, qualified, and translated into product implications.
- MVP scope, exclusions, risks, and measures are unambiguous.
- Domain rules contain stable IDs, validations, edge cases, and test scenarios.
- Each of the three visual directions covers the ten required screens and is meaningfully different.
- Architecture decisions identify reversible and expensive-to-reverse choices.
- An independent review is completed and all P0–P2 findings are resolved or named as blockers.
- Repository, branch, validation, push, and pull-request state are reported without overclaiming.

## Decision owners

- Product owner: product direction, MVP boundary, visual direction, architecture acceptance, critical journeys, and production start
- Lead orchestrator: integration, requirement coverage, dependency ordering, evidence, rework, and milestone acceptance proposal
- Specialist owners: research, domain, UX, design, architecture, and quality artefacts within the operating model

## Stop condition

After the foundation package is validated and presented, stop. The next authorised action is product-owner review, not production development.
