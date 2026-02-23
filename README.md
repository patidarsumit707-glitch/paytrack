# PayTrack

Mobile-first weekly supplier payment planner.

## Stack
- Next.js (React + Node runtime)
- MongoDB + Mongoose
- REST API routes

## Setup

```bash
npm install
npm run dev
```

Set MongoDB URI if needed:

```bash
MONGODB_URI=mongodb://127.0.0.1:27017/paytrack
```

## Features
- Dashboard summary cards for Current, Next, Week+2, Outstanding.
- Party list with Pay, Skip, Edit, Delete.
- Add Party form (name + total due only).
- Automated 13-week schedule generation from settings percentages.
- 13-week settings with equal/front-heavy/back-heavy/custom presets.
- Skip logic redistributes remaining balance over future weeks using normalized remaining percentages.
- Full 13-week background tracking with payment history.
