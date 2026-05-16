# Personal Website

Full-stack personal portfolio for Wei Wang — Senior Backend Engineer.

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, Vite |
| Backend | Node.js, Express, TypeScript, tsx |

## Project Structure

```
website/
├── frontend/          # React + TypeScript + Tailwind (Vite)
│   ├── public/        # Static assets (avatar.jpeg, etc.)
│   └── src/
│       ├── api.ts           # Typed fetch wrappers
│       ├── types.ts         # Shared TypeScript interfaces
│       ├── hooks/           # useApi data-fetching hook
│       ├── components/      # Navbar
│       └── sections/        # Hero, Skills, Projects, Experience, Contact
├── backend/           # Node.js + Express + TypeScript (tsx)
│   └── src/
│       └── index.ts         # REST API + production static file serving
└── package.json       # Root scripts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install dependencies

```bash
npm --prefix frontend install
npm --prefix backend install
```

### Development

Run frontend and backend in separate terminals:

```bash
# Terminal 1 — API on http://localhost:3001
npm run dev:backend

# Terminal 2 — UI on http://localhost:5173
npm run dev:frontend
```

The frontend proxies `/api/*` requests to the backend via Vite's dev proxy — no CORS issues.

### Production

```bash
# Build the React app, then start Express (serves both API and frontend)
npm run build
npm start
```

The single Express process serves the React app from `frontend/dist/` and handles all `/api/*` routes. Visit `http://localhost:3001`.

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/profile` | Name, title, bio, location, socials |
| `GET` | `/api/skills` | Skill groups with items |
| `GET` | `/api/projects` | Project cards |
| `GET` | `/api/experience` | Work history |
| `POST` | `/api/contact` | Contact form submission |
