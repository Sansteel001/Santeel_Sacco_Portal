# SANSTEEL SACCO — Member Portal PWA

A Progressive Web App (installable to home screen) version of the SANSTEEL SACCO
member portal. The Google Sheets / Apps Script backend is unchanged and remains the
single source of truth for member data. This PWA is a static front-end that talks to
that backend through cross-origin JSONP.

## Two parts

1. **Backend (Apps Script)** — one small addition to your existing `Code.gs`.
2. **Front-end (this PWA)** — static files hosted on GitHub Pages.

---

## PART 1 — Update the Apps Script backend (required)

Open your Apps Script project (the one with `Code.gs` and `Guarantorworkflow.gs`),
then open `backend-additions.gs` (in this bundle) and:

1. **Insert the 9 new `?page=` routes** into `doGet()`, directly ABOVE the final
   `} else { template = HtmlService.createTemplateFromFile("index"); }` line.
2. **Append `getStatementCombined()`** anywhere in `Code.gs`.
3. Save and **redeploy the Web App** (Deploy → Manage deployments → edit → Version:
   New version). Keep **"Execute as: Me"** and **"Who has access: Anyone"**.

> These additions reuse the `_jsonp(callback, data)` helper already defined in
> `Guarantorworkflow.gs`, so keep that file in the project.

**No changes to your existing sheets or logic.** The additions only expose existing
functions as JSONP so the static PWA can call them from another domain.

The 9 new endpoints added: `login`, `createaccount`, `secquestion`, `resetpin`,
`summary`, `memberloans`, `getstatement`, `submitnom`, `submitsharechange`.

---

## PART 2 — Deploy the PWA to GitHub Pages

### A. Create a repo and push these files

Put the following files at the **root** of a GitHub repo:

```
index.html
statement.html
loan.html
viewloan.html
receipts.html
nomination.html
viewnom.html
sharechange.html
viewsharechange.html
guarantor.html
config.js
app.js
manifest.json
sw.js
assets/logo.png
icons/icon-192.png
icons/icon-512.png
icons/icon-maskable-512.png
```

(Do **not** push `backend-additions.gs` — that is pasted into Apps Script, not the
website. It's included here only for convenience.)

### B. Turn on GitHub Pages

1. Repo → **Settings** → **Pages**.
2. Under *Build and deployment*, set **Source = Deploy from a branch**, and pick
   your default branch (e.g. `main`) with folder `/ (root)`.
3. Save. In a minute or two you'll get a URL like:
   `https://<your-username>.github.io/<repo-name>/`

### C. Update the backend URL (only if it ever changes)

The Apps Script Web App URL lives in **one place**: `config.js`
(`window.APPS_SCRIPT_URL`). If you ever redeploy to a new URL, edit that single file
and the whole PWA follows.

### D. Install on a phone

Open the GitHub Pages URL on an Android phone (Chrome) → menu → **Add to Home screen**,
or on iPhone (Safari) → Share → **Add to Home Screen**. It launches like a native app.

---

## What is in the PWA vs. linked out

Migrated into the PWA (10 pages): portal/login, statement, loan application (all 5
loan types + guarantor workflow), loan viewer, receipts, nomination + viewer, share
change + viewer, and the guarantor response portal.

**Registration stays on the Apps Script page** (because it uploads document files,
which JSONP can't carry). The PWA's "Register" button links out to the existing
Apps Script registration form. That page continues to work exactly as before.

---

## Important notes

- **Security:** your `Code.gs` still has a hardcoded fallback password (`SST2025`)
  and a weak PIN hash. Recommend removing the fallback and strengthening the hash —
  but the PIN-hash change requires existing members to reset their PIN, so do it
  deliberately.
- **Shared sheets:** `Summary` and `Statement` read from shared sheets that get
  temporarily written to. This is pre-existing behaviour; under heavy concurrent
  use two members could in theory affect each other's view. Flag for a future
  refactor (read directly from the source sheets instead).
- **Logo/icons:** placeholder navy/gold "SS" artwork is used. Replace
  `assets/logo.png` and the three files in `icons/` with your real logo when ready.

## Quick test

1. Deploy the backend additions (Part 1).
2. Open `index.html` (via GitHub Pages or locally).
3. Log in with a member's National ID + PIN, or use **Create Account** if none exists.
4. Try: Summary lookup, loan status, statement generation, nomination, share change,
   and the guarantor portal (via the "Respond to Guarantor Request" button).
