# Deployment

## Production environment variables

The frontend **must** have these set in your hosting platform (Vercel, Netlify, etc.):

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base URL (no trailing slash). Example: `https://your-backend.onrender.com/api` |
| `NEXT_PUBLIC_API_VERSION` | No | Default: `v1` |

### Fix: "Cannot GET /api/v1/..." in production

This error means `NEXT_PUBLIC_API_URL` is not set in production. The app falls back to `/api` (same origin), but Next.js has no API routes there, so you get 404.

**Solution:** Set `NEXT_PUBLIC_API_URL` to your deployed backend URL in your hosting platform's environment variables, e.g.:

- Vercel: Project → Settings → Environment Variables
- Netlify: Site → Build & deploy → Environment
- Other: Add to your build/deploy config

Then **redeploy** the app (env vars are baked in at build time).
