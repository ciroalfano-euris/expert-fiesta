# OctoFit Tracker architecture

OctoFit Tracker is a three-tier application for a school fitness program. The starter code includes API contracts and intentionally incomplete implementation points so you can use GitHub Copilot agent mode in a test-driven loop.

![Three-tier OctoFit architecture](../.github/images/octofit-architecture.svg)

## Tier boundaries

- **Presentation tier**: React 19, Vite, React Router, Bootstrap, and a shared API client in `octofit-tracker/frontend/src`.
- **Logic tier**: Express and TypeScript routes/services in `octofit-tracker/backend/src` expose `/api/*` behavior on port `8000`.
- **Data tier**: Mongoose models and seed data in `octofit-tracker/backend/src/models` and `src/scripts/seed.ts` persist to MongoDB on port `27017`.

## Ports and environment rules

- MongoDB: `27017`
- Express API: `8000`
- Vite frontend: `5173`
- The browser calls relative `/api` paths. Vite proxies them to `http://localhost:8000`, so the unauthenticated API port stays private in Codespaces. `VITE_API_BASE_URL` can override the base URL.

## API contract

| Capability | Method and path | Expected behavior |
| --- | --- | --- |
| Activity tracking | `GET /api/activities`, `POST /api/activities` | List and create valid activity records. POST accepts `userId`, `teamId`, `type`, and `minutes`; `userId` and `teamId` must be well-formed IDs for an existing user and team; otherwise respond with a deliberate 4xx (never a 500 from a cast error). A created activity stores the submitted `user`, `team`, `type`, and `minutes` plus computed `points` and `occurredAt`. |
| Teams | `GET /api/teams`, `POST /api/teams` | List and create teams with members. Created and listed teams keep the submitted `name` and `mascot`. Reject a team without a name with `400`. |
| Leaderboard | `GET /api/leaderboard` | Return teams ordered by the sum of their activity points, highest first. Each entry has `teamName`, `totalPoints`, and a 1-based `rank`. |
| Workout suggestions | `GET /api/workouts/suggestions/:userEmail` | Recommend workouts from recent activity patterns for the matching seeded user's email address. The first suggestion's `focus` matches that user's goal or recent activity, with a `reason` explaining why. An email with no matching user returns a deliberate 4xx (for example, `404`). |

## Implementation decisions

- Presentation tier decision: Keep page rendering and interaction in React, with all HTTP calls routed through the shared frontend API client. Each data-driven page will expose accessible loading, empty, and error states; it will not access MongoDB or implement business rules.
- Logic tier decision: Keep request validation, business rules, response shaping, and status codes in Express routes/services. Use deliberate 4xx responses for invalid or unknown input, and keep the API unauthenticated for this exercise.
- Data tier decision: Represent users, teams, activities, and workouts with Mongoose models, with required fields and relationships validated at the model boundary. Keep representative seed data in the existing seed script and make seeding idempotent.
- Activity tracking approach: Validate the request body and confirm both referenced IDs are well-formed and resolve to existing records before creating an activity. Persist the user, team, type, minutes, computed points, and occurrence time; return validation and lookup failures as 4xx responses rather than cast-error 500s.
- Team management approach: List teams with their members and create teams from the submitted name and mascot. Require a non-empty name and return `400` when it is missing; do not silently substitute defaults for submitted values.
- Leaderboard approach: Aggregate persisted activity points by team, sort totals descending, and shape each result with the team name, total points, and a 1-based rank.
- Workout suggestions approach: Find the requested user by email, consider their goal and recent activity when selecting suggestions, and include a concise reason for the top suggestion. Return a deliberate 4xx response if no user matches.

## Test plan

- Data tier — `npm run test:data --prefix octofit-tracker/backend`: **4 failed, 1 passed** on the initial run. The failures show missing required validation for user identity/goals, team name/mascot, activity fields, and workout fields; the idempotent seed test passed.
- API — `npm run test:api --prefix octofit-tracker/backend`: **4 failed** on the initial run. Invalid activity and team requests returned `501` instead of `400`, the leaderboard returned no entries, and the first workout suggestion lacked the expected reason.
- Frontend — `npm test --prefix octofit-tracker/frontend`: **15 failed** on the initial run. Failures covered API-backed activity rendering and workout requests, plus loading, empty, and error states for activities, teams, leaderboard, and workouts.
- Backend build — `npm run build --prefix octofit-tracker/backend`: **passed** on the initial run. A failure indicates a TypeScript compile/type-check problem.
- Frontend build — `npm run build --prefix octofit-tracker/frontend`: **passed** on the initial run. A failure indicates a TypeScript or production-bundling problem.
- Run the data tests first, then API tests, then frontend tests as their dependencies are implemented; rerun both builds after changes. A passing build verifies compilation and bundling, not API or UI behavior, so the contract tests remain required.
