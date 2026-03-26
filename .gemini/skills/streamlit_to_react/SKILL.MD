---
name: streamlit-to-fullstack
description: >
  Converts a Streamlit Python app into a modern full-stack application with a React/TypeScript
  frontend and FastAPI backend — preserving 100% of the original business logic. Trigger this
  skill whenever the user mentions migrating, converting, or rebuilding a Streamlit app, or asks
  to "turn my .py app into a proper web app", "build a frontend for my Streamlit app", or wants
  to productionize a data/ML app. Also trigger when the user provides a .py file and asks for a
  TypeScript or React equivalent. The goal is a 1:1 functional replica with a polished,
  production-grade UI.
---

# Streamlit → Full-Stack Converter

You are acting as a senior full-stack engineer who specializes in migrating data-heavy Python
apps to production-grade web applications. Your job is to analyze a Streamlit app and produce an
architecturally clean, visually excellent full-stack replacement.

---

## Inputs to collect before starting

Ask the user for the following if not already provided:

1. **The Streamlit `.py` filename** — the entry point of the app. Scan the current working
   directory (and subdirectories if needed) to locate it.
2. **A UI/style guide file** (optional) — a path to any document describing the desired visual
   design. If absent, apply the default design system described below.

Do not proceed until you have at least the filename.

---

## Step 1 — Deep analysis of the Streamlit app

Read the entire `.py` file carefully. Produce a thorough internal analysis covering:

- **Purpose** — what the app does end-to-end, in plain language
- **Inputs** — every widget (sliders, dropdowns, text inputs, file uploaders, buttons, etc.),
  its type, default value, and what it controls
- **Business logic** — every computation, transformation, model call, data processing step,
  or algorithm. Note dependencies (libraries, local modules, data files)
- **Outputs** — every chart, table, metric, text block, or download the app produces, and
  exactly what data drives each one
- **State & reactivity** — how inputs connect to outputs; which widgets trigger recomputation
  of which results
- **External dependencies** — APIs, databases, file paths, environment variables

This analysis is the source of truth for everything that follows. Be thorough — missed logic
means a broken migration.

---

## Step 2 — Architecture decision

The architecture is fixed:

- **Backend**: Python + FastAPI. Owns 100% of business logic, computation, and data access.
  Returns only the minimal payload needed by the frontend to render.
- **Frontend**: React + TypeScript. Owns 100% of UI, layout, interactivity, and visualization.
  Never computes anything — only sends user inputs to the backend and renders what comes back.
- **Communication**: REST over HTTP. Each meaningful user interaction maps to a POST or GET
  endpoint. Design endpoints around operations, not widgets.
- **Plotting**: Choose exactly one visualization library — either **Vega-Lite** (via
  `react-vega`) or **D3.js** — and use it consistently throughout the entire frontend. Pick
  whichever is better suited to the chart types in the original app. Do not mix libraries.
  The choice should result in the most aesthetically refined and interactive charts possible.

No business logic leaks into TypeScript. If something requires a calculation, it goes in Python.

---

## Step 3 — Project structure

Create the following layout inside the user's current working directory:

```
project-root/
├── backend/
│   ├── main.py              # FastAPI app, all routes
│   ├── logic/               # Extracted business logic modules
│   ├── models/              # Pydantic request/response schemas
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Route-level views
│   │   ├── api/             # All fetch/axios calls, typed
│   │   ├── types/           # TypeScript interfaces mirroring backend schemas
│   │   └── App.tsx
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
└── README.md                # Root-level guide
```

---

## Step 4 — Backend implementation

Extract all business logic from the Streamlit file into clean Python modules under
`backend/logic/`. The `main.py` file should only contain FastAPI route definitions that call
into these modules.

Guidelines:
- Each route accepts a Pydantic model as its request body and returns a Pydantic model as its
  response. No raw dicts.
- Response payloads contain only what the frontend needs to render — not intermediate objects
  or full dataframes unless required.
- For chart data, return a structured array of records the frontend can feed directly into the
  visualization library.
- Preserve all original logic exactly — same algorithms, same defaults, same edge case handling.
- Enable CORS for local development.
- Use clear, descriptive endpoint names that reflect the operation, not the widget.

---

## Step 5 — Frontend implementation

Build the React/TypeScript frontend to be a faithful visual and functional replica of the
original Streamlit app, with a significant visual upgrade.

### UI fidelity
- Every input widget from the original app must have a frontend equivalent, with the same
  defaults and constraints.
- Every output (chart, table, metric, text) must be rendered with the same data and semantics
  as the original.
- Reactive behavior must match: changing an input should trigger the same recomputations.

### API layer
- Place all API calls in `src/api/`. Each function should be typed end-to-end — typed request
  parameters, typed response.
- Handle loading states and errors gracefully in the UI.

### Visualization
- Use only the chosen library (Vega-Lite or D3) for all charts.
- Invest heavily in chart aesthetics: thoughtful color palettes, clear axes, interactive
  tooltips, smooth transitions. The charts should look noticeably better than the Matplotlib
  or Plotly defaults in the original Streamlit app.

### Design system
If the user provided a style guide, apply it faithfully. Otherwise, apply the default below.

---

## Default design system (when no style guide is provided)

Apply a consistent dark UI with the following character:

- **Background**: Deep near-black, not pure black — subtle warmth or cool tone acceptable
- **Accent**: Purple, used for interactive elements, active states, and key data highlights
- **Surface layers**: Two to three levels of card/panel elevation using slightly lighter dark tones
- **Typography**: Clean sans-serif; strong visual hierarchy between headings, labels, and body
- **Inputs**: Styled to feel native to the dark theme — no default browser chrome
- **Charts**: Dark background, muted grid lines, vibrant data series colors anchored by the
  purple accent
- **Spacing**: Generous — avoid cramped layouts
- **Motion**: Subtle transitions on state changes; nothing distracting

The overall impression should be: a polished internal tool or SaaS dashboard, not a prototype.

---

## Step 6 — README files

Write three README files:

### `backend/README.md`
- What the backend does and how it's structured
- Description of every endpoint: method, path, request schema, response schema
- Description of every logic module and what it computes
- Environment variables and configuration

### `frontend/README.md`
- What the frontend does and how it's structured
- Component inventory: what each component renders and what props it takes
- API integration: which frontend actions call which backend endpoints
- Visualization library used and why

### `README.md` (root)
The primary entry point. Must include:

**How to run (development)**

1. Clone/navigate to the project
2. Backend setup:
   - Create and activate a virtual environment
   - `pip install -r backend/requirements.txt`
   - Start the server: `uvicorn main:app --reload` from the `backend/` directory
   - Note the local URL (default: `http://localhost:8000`)
3. Frontend setup:
   - `cd frontend`
   - `npm install`
   - Set the backend URL in the appropriate env/config file
   - `npm run dev`
   - Open the browser URL shown in the terminal
4. Any data files or environment variables required
5. Brief description of what the app does

---

## What the skill does vs. what the user does

The skill writes code and documentation only. It does **not** execute any setup or installation
commands. The following steps are entirely the user's responsibility and must never be run by
the skill — they should instead be clearly documented in the README in the correct order:

- Creating and activating a virtual environment
- Running `pip install -r requirements.txt`
- Scaffolding the frontend (e.g. via a Vite template)
- Running `npm install`
- Starting the Python/FastAPI server
- Running `npm run dev`

The README must spell these out as a numbered, sequential checklist so the user can follow
along without guessing.

---

## Quality checklist before finishing

Before declaring the migration complete, verify:

- [ ] Every widget from the original Streamlit app has a working frontend equivalent
- [ ] Every chart or table output is rendered with correct data
- [ ] No business logic exists in TypeScript
- [ ] All API calls are typed end-to-end
- [ ] Only one visualization library is used throughout
- [ ] CORS is configured on the backend
- [ ] All three README files are complete and accurate
- [ ] The root README has a clear, working dev setup guide
- [ ] The UI matches the provided style guide, or the default dark/purple system if none was given

---

## Handling ambiguity

- If the Streamlit app imports local modules that are not provided, note them clearly in the
  backend README and create stub implementations with clear TODOs.
- If the app reads from files or databases, document the expected format and create a sample
  data fixture if possible.
- If a Streamlit feature has no clean REST equivalent (e.g., streaming progress), use
  Server-Sent Events or polling and note the approach.
- When in doubt about a design decision, prefer the solution that keeps the frontend dumb and
  the backend authoritative.