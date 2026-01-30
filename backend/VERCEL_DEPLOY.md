# Vercel backend deployment checklist

If `/api/v1/quran/*` returns **"API Not Found"** on the live site, the deployed backend is using an **old build** that doesn’t include the Quran module.

## Fix

### 1. Vercel project settings (class-echo-backend)

- **Root Directory:** set to `backend`  
  (So Vercel uses `backend/package.json` and runs the build from the backend folder.)

- **Build Command:** `npm run build`  
  (So every deploy runs `tsc` and regenerates `dist/` with the Quran module.)

- **Install Command:** `npm install` (default is fine.)

Save and **redeploy** (e.g. trigger a new deployment from the Deployments tab).

### 2. Optional: commit a fresh build

If you prefer the repo to always have an up-to-date `dist/`:

```bash
cd backend
npm run build
git add dist
git commit -m "chore(backend): rebuild dist with Quran module"
git push
```

Then redeploy on Vercel (or let the next push trigger a deploy). With **Root Directory = `backend`** and **Build Command = `npm run build`**, Vercel will also build on each deploy, so this step is optional but can help if the build ever fails on Vercel.

### 3. Verify

After redeploying, open:

- `https://class-echo-backend.vercel.app/api/v1/quran/students?page=1&limit=10`

You should get JSON (e.g. `{ "success": true, "data": [...], "meta": {...} }`) instead of "API Not Found !!".
