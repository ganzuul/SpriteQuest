# SpriteQuest

<p align="center">
  <a href="https://github.com/ganzuul/SpriteQuest/actions/workflows/ci.yml">
    <img alt="CI" src="https://github.com/ganzuul/SpriteQuest/actions/workflows/ci.yml/badge.svg" />
  </a>
  <a href="LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-blue.svg" />
  </a>
  <a href="https://nodejs.org/">
    <img alt="Node 24" src="https://img.shields.io/badge/Node-24.x-339933?logo=node.js&logoColor=white" />
  </a>
</p>

> SpriteQuest is in the very early stages of a years-long ambition: a Lattice-based toolkit for SillyTavern that turns narrative consistency, scene orchestration, and worldbuilding into actual systems instead of one-off prompts.

SpriteQuest is a fork and continuation of the Lattice workflow extension, built to help storytellers construct and operate narrative systems inside SillyTavern. The project is intentionally ambitious: it aims to combine workflow authoring, roster and ledger state tracking, asset provenance, map and sprite generation, and review-oriented scene logic into a single creative stack.

This is early-stage work, but the direction is clear: build practical infrastructure for story-world tools that can grow over time without losing the architecture underneath them.

## What we are building

At its core, SpriteQuest treats story tools as systems rather than isolated AI chat outputs. It combines:

- node-based workflow orchestration inherited from Lattice
- narrative state tracking, including standing, ledgers, and guidance loops
- an optional companion service for structured event handling and state management
- workflow-driven scene review and publish stages
- generated or curated world assets, including maps, terrain, sprites, and NPC sheets

The project deliberately blurs the line between engineering reality and in-world fiction. The “Forge,” ledger systems, and world assets are both practical software features and part of the project’s lore and design language.

## Building on Lattice

SpriteQuest sits in the Lattice lineage, but it is not just a copy of the original extension. Recent work points toward a deeper layer of narrative and world-building support:

- character standing and story-state continuity
- event-ledger and roster guidance loops
- generated art and asset pipelines
- 3D and map tooling for terrain, floorplans, and rendered previews
- companion tooling that supports SillyTavern workflows outside the browser UI

The long-term intent is to make a serious story operating system for roleplay worlds: tools for scenes, characters, continuity, generation, and review as a connected toolkit rather than isolated prompts.

## Current repository shape

- `src/` and `ui/` — workflow engine and editor logic
- `workflows/` — example and reusable Lattice-style workflows
- `companion/` — Python service, NPC tooling, forge logic, and render pipeline
- `library/` and `assets/` — world definitions, manifests, assets, and generated artifacts
- `docs/` — documentation and operator guides
- `tests/` and `test/` — validation and integration checks

## Early-stage roadmap

This is a long-horizon project with several major directions already underway:

- narrative workflow authoring in SillyTavern
- scene and world-state management through ledger-like systems
- generated and reviewed props, sheets, terrain, and map outputs
- reproducible asset provenance and composition workflows
- a foundation for future visual and narrative tooling without locking the project into a single prototype

## Development

```bash
npm install
npm test
npm run check:types
npm run build
