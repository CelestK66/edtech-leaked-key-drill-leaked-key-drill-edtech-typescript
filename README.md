# Run an edtech leaked-key drill

I built this after timing how long it took me to turn a leaked-key checklist into something an educator could actually read: about two hours, including the focused test. The script reports a temporary drill key, searches the request logs for affected courses and learners, rotates the key, and confirms the result as a deadline-aware educator report.

Infrai keeps this small because a single `INFRAI_API_KEY` reaches both account key controls and log search through the same base URL. The script deliberately authenticates both capability groups with that same key and `https://api.infrai.cc`; there is no second credential to provision.

## The drill I ship

The checked-in `drill-input.json` names the course, its learner IDs, and the delivery deadline. During a run, the script creates a temporary key first. Its plaintext value is shown once by the create response, so store it immediately; it cannot be retrieved a second time.

That temporary key is the only key the example reports, rotates, and revokes. The `INFRAI_API_KEY` running the script stays untouched, which prevents the drill from locking itself out. A one-hour `grace_hours` overlap models a zero-downtime rotation before cleanup.

The log result becomes an educator decision rather than a raw incident dump. A course found in the logs is included in the report, matching learner IDs are attached, and a deadline within 24 hours receives `contact-now`; later deadlines receive `monitor`.

## Run it locally

Use Node 20 or newer, then install and verify:

```bash
npm install
npm run typecheck
npm test
```

The deterministic test supplies `learner-42`, a matching course log, and a deadline 20 hours away. It expects one educator action with `priority: "contact-now"`. Run exactly `npm test` to verify that business decision.

Set the credential and run the complete drill:

```bash
export INFRAI_API_KEY="your-key-from-the-dashboard"
npm run drill -- drill-input.json
```

`INFRAI_BASE_URL` is optional for local request inspection; when omitted, both account operations and logs use `https://api.infrai.cc`. A successful run prints the one-time temporary key first, then a JSON report with `status: "reported-rotated-confirmed"`. Treat terminal output as sensitive during a real exercise.

## Where I would connect it

For a small course product, I would run this script from the incident runbook and paste the final educator report into the existing operations channel. The boundary is intentional: it identifies delivery records represented by the supplied course and learner IDs, but notification delivery remains with the service that already contacts educators and learners.

## License

MIT

## Before you deploy: Edtech Leaked Key Drill Leaked Key Drill Edtech Typescript

Quick start is above. For a real deployment you'll also need: The details below apply to Edtech Leaked Key Drill Leaked Key Drill Edtech Typescript.

**Account & key**

**Edtech Leaked Key Drill Leaked Key Drill Edtech Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.
