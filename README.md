# NeuroAtlas

**Explore the human brain, one connection at a time.**

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square) ![Three.js](https://img.shields.io/badge/Three.js-black?logo=three.js&logoColor=white&style=flat-square) ![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square) ![Status](https://img.shields.io/badge/status-V1%20prototype-6C63FF?style=flat-square) ![Bilingual](https://img.shields.io/badge/language-FR%20%2F%20EN-00B8A9?style=flat-square)


---

## Overview

NeuroAtlas is an interactive 3D exploration tool for the human brain, built as a personal portfolio project ahead of a Master's application in cognitive neuroscience. It combines an anatomical atlas, network visualization, functional/pathological overlays, and a lifespan simulation into a single interface (think of it as a small) stylized "Google Maps" for brain regions.

> **This is a V1 prototype.** Anatomy is simplified (geometric, not derived from real imaging data), and some visualizations (aging effects) are illustrative approximations rather than clinically validated models. See [Limitations](#-limitations--honest-disclaimers) below.

---

## Features

- **Interactive 3D Brain** → click any lobe to open a detail panel (function, associated structures, key study)
- **Connections Mode** → toggle glowing neon arcs showing structural/functional links between regions, with type, strength, direction, and role
- **Brain Networks** → highlight and compare canonical networks (Default Mode Network, Salience Network), with overlap regions shown distinctly
- **Functions Mode** → select a cognitive function (memory, attention, language, vision, motor coordination) to see which regions are involved
- **Diseases Mode** → select one or more neurological conditions (Alzheimer's, Parkinson's, ADHD) to compare affected regions and circuits
- **Lifespan Slider** → drag a 20–90 age slider to see a simplified visual proxy of age-related brain changes
- **Bilingual** → every label and region description is available in French and English via a single toggle

---

## Live Demo

[Try NeuroAtlas on StackBlitz](https://vitejsvite4daxv8dv-lnl2-5173--87cf54cd.local-credentialless.webcontainer.io)

*(Note: replace with your permanent StackBlitz project link before sharing)*

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React + TypeScript |
| Build tool | Vite |
| 3D rendering | Three.js via `@react-three/fiber` + `@react-three/drei` |
| Styling | Inline styles (no external UI framework) |

---

## Project Structure

neuroatlas/
├── src/

│   ├── App.tsx        → Main component: 3D scene, modes, sidebar logic

│   ├── main.tsx

│   └── index.css

├── index.html

└── package.json

## Getting Started

```bash
git clone https://github.com/Anyma-exe/neuroatlas.git
cd neuroatlas
npm install
npm run dev

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.

## Author
Built by Anyma Ali Msa, Psychology student and aspiring cognitive neuroscience researcher.
