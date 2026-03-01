# Deployment and Seed Verification

## Overview
`seedAtlas` was added to guarantee fixed demo users for all system roles using deterministic credentials and `upsert`.
This prevents random credentials and keeps login access predictable after migration or deployment.

## Pre-reqs
- Node.js and npm installed.
- Access to backend repo.
- Atlas production `MONGODB_URI` available (do not share it).
- Railway access (for variables/logs verification).

## Safe Local Seeding on Atlas Production
1. Ensure `back-end/.env.production` contains production `MONGODB_URI` from Railway Variables.
2. Never print full URI. Validate only `host + dbName`.
3. Run:
```powershell
npm ci
npm run build
$env:NODE_ENV='production'
npm run seed:atlas
```
4. Expected printed accounts:
```text
receiving_officer / receiving_officer123456
preparation_officer / preparation_officer123456
pilot / pilot123456
management / management123456
general_manager / general_manager123456
alateeb / admin123456
```

## Mongo Atlas Verification
1. Atlas UI -> Database -> target cluster -> target database.
2. Open `users` collection.
3. Confirm these users exist:
   - `receiving_officer`
   - `preparation_officer`
   - `pilot`
   - `management`
   - `general_manager`
   - `alateeb`
4. Confirm:
   - `status` is `Active`.
   - `roleId` maps to expected role.
   - `passwordHash` is hashed (bcrypt), not plaintext.
5. Compare users count before and after `seed:atlas` to verify upsert behavior.

## Railway Verification
1. Open Railway service `al-atyb-system-back-end` -> `Variables`.
2. Compare only:
   - `MONGODB_URI` host
   - `MONGODB_URI` dbName
3. Open `Logs` and ensure no startup/runtime crash after deployment.

## Troubleshooting
### Invalid credentials in login
- Re-run `seed:atlas` against the same DB used by backend runtime.
- Ensure `NODE_ENV=production` when targeting `.env.production`.
- Confirm account usernames exactly match seeded values.

### 401 refresh token missing
- Usually client session/cookies issue, not seed issue.
- Re-login after clearing stale cookies/tokens.
- Confirm frontend sends credentials and backend CORS/cookie config matches environment.

### DB mismatch (Railway connected to another DB)
- Extract `host + dbName` from local target URI.
- Compare against Railway `MONGODB_URI` (`host + dbName` only).
- If different, backend is reading a DB other than the seeded one.

## Important Safety
- Never run any command that drops production DB.
- Never expose full `MONGODB_URI` or passwords in docs/logs.
- Use placeholders like `[REDACTED]` for secrets.

## Verification Record (2026-03-02)
- Latest commit present on `main`: `64d0e6d` (`Add hardcoded demo seed users`).
- Seed script exists: `src/scripts/seedAtlas.ts`.
- `seed:atlas` exists in `package.json`.
- Production target from `.env.production`:
  - host: `cluster0.yuachte.mongodb.net`
  - dbName: `altyeb_system`
- Local verification (from `.env`):
  - host: `127.0.0.1:27017`
  - dbName: `alateeb`
  - users count before seed: `11`
  - users count after seed: `11` (upsert verified)
  - all 6 demo users exist with `status=Active`, valid role mapping, and bcrypt hashes.
- Production seed attempt status:
  - blocked by Atlas connectivity/whitelist from current machine (`ReplicaSetNoPrimary` / whitelist guidance).
- Railway verification status from current machine:
  - blocked (Railway CLI requires authenticated login).

