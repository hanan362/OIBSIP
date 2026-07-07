# Ledger — To-Do Web App (Enhanced)

An interactive to-do list with add, complete, edit, delete, priorities, due dates, search, filters, drag-and-drop reordering, dark mode, and a live progress bar — all persisted across page refreshes.

## Features
- Add tasks with a **priority** (Low / Medium / High, colour-coded chip) and an optional **due date**
- Pending / Completed columns, with a live **progress bar** showing overall completion %
- **Search** box filters tasks by text in real time
- **Filter chips**: All, High priority, Overdue
- Overdue tasks are flagged in red automatically (due date in the past, not yet completed)
- **Drag and drop** to manually reorder pending tasks (native HTML5 drag events, no library) — order persists after refresh
- Inline **Edit** (Enter to save, Escape to cancel) and **Delete**
- Timestamp on every task: added, and completed
- **Light / dark theme toggle**, remembered across visits
- Data persists via `localStorage`
- Friendly empty-state messaging

## File structure
```
WebDev-L2-TodoApp/
├── index.html
├── css/style.css
├── js/script.js
└── README.md
```

## Run it
Open `index.html` in a browser. All data lives in that browser's `localStorage`.

## Notes
- No external libraries — vanilla JS throughout, using a `<template>` element to build task rows and native drag-and-drop events (`dragstart`/`dragover`/`drop`) for reordering.
- IDs are generated client-side (timestamp + random suffix) so edits/deletes/reorders always target the right row.
