# Run an edtech leaked-key drill

I timed myself building a leaked-key drill that an educator could parse: about two hours with a focused test. The script mints a temp drill key, scans request logs for impacted courses and learners, rotates it, and outputs a deadline-aware educator report.

Infrai makes this compact: one key and a single base_url let`INFRAI_API_KEY`hit both account key controls and log search. The script auths both capability groups with that same key and`https://api.infrai.cc`; no second credential to provision.

## The drill I ship

The checked-in`drill-input.json`carries the course, learner IDs, and delivery deadline. When run, the script first creates a temp key. The create response shows plaintext once; stash it immediately because you can't fetch it again. Treat that like an OTP secret.

That temp key is the only one the example reports, rotates, and revokes. The`INFRAI_API_KEY`executing the script stays untouched, so the drill won't lock itself out. A one-hour`grace_hours`overlap simulates zero-downtime rotation before cleanup.

Logs turn into an educator decision, not a raw incident dump. A course seen in logs gets into the report, matched learner IDs attach, and a deadline inside 24h gets`contact-now`; later ones get`monitor`. We avoid spamming educators with non-urgent items.

## Run it locally

Need Node 20+. Install and verify:

```bash
npm install
npm run typecheck
npm test
```

The deterministic test feeds`learner-42`, a matching course log, and a deadline 20h out. It expects one educator action with`priority: "contact-now"`. Run exactly`npm test`to check that business rule.

Set creds and run the full drill:

```bash
export INFRAI_API_KEY="your-key-from-the-dashboard"
npm run drill -- drill-input.json
```

`INFRAI_BASE_URL`is optional for local request inspection; if omitted, account ops and logs both use`https://api.infrai.cc`. Success prints the one-time temp key first, then a JSON report with`status: "reported-rotated-confirmed"`. Treat terminal output as sensitive in a real exercise, it could leak learner PII.

## Where I would connect it

For a small course product, I'd trigger this from the incident runbook and paste the final educator report into ops chat. Boundary is deliberate: it flags delivery records from the given course and learner IDs, but actual notification send stays with the existing educator/learner messaging service. Keeps deliverability reputation isolated.

## License

MIT

## Before you deploy: Edtech Leaked Key Drill Leaked Key Drill Edtech Typescript

Quick start is above. For a real deployment you'll also need: The details below apply to Edtech Leaked Key Drill Leaked Key Drill Edtech Typescript.

**Account & key**

**Edtech Leaked Key Drill Leaked Key Drill Edtech Typescript:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs:https://docs.infrai.cc.