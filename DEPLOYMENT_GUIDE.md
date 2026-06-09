# StockVision AI - Deployment Guide

## Current Status
- ✅ Build process working
- ✅ Routes configured
- ✅ Authentication implemented
- ✅ Environment variables validated
- ⚠️ Deployment needs platform selection

## Deployment Options

### Option 1: Cloudflare Pages (RECOMMENDED) ✅
**Status**: Fully configured, ready to deploy

**Why this is best**:
- Already configured with `wrangler.jsonc`
- Optimized server build in `dist/server/`
- Full SSR support with Cloudflare Workers
- Environment variables ready
- Better performance with Cloudflare's edge network

**Setup**:
1. Install Wrangler: `npm install -g wrangler`
2. Authenticate: `wrangler login`
3. Deploy: `wrangler pages deploy dist/client --project-name=stockvision-ai`
4. Set environment variables in Cloudflare dashboard

**Files**:
- `wrangler.jsonc` - Cloudflare configuration
- `dist/server/index.js` - Worker entry point
- `dist/client/` - Static assets & index.html

---

### Option 2: Vercel (ALTERNATIVE) ⚠️
**Status**: Configured for SPA fallback (not optimal for SSR)

**Limitations**:
- SSR requires custom serverless functions
- Using SPA mode (client-side routing only)
- Less optimal performance than Cloudflare

**Setup**:
1. Connect GitHub to Vercel
2. Set environment variables:
   - SUPABASE_URL
   - SUPABASE_PUBLISHABLE_KEY
   - VITE_* variables (prefixed for client)
   - API keys (GEMINI, NEWS, etc)
3. Deploy: Vercel auto-deploys on git push

**Files**:
- `vercel.json` - Vercel configuration
- `dist/client/index.html` - SPA entry point

**Key configuration**:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/client",
  "rewrites": [{"source": "/(.+)", "destination": "/index.html"}]
}
```

---

### Option 3: Netlify (ALSO SUPPORTED) ⚠️
**Status**: Configured with netlify.toml

**Setup**:
1. Connect GitHub to Netlify
2. Set environment variables
3. Deploy

**Files**:
- `netlify.toml` - Netlify configuration

---

## Environment Variables

### Required for All Deployments
```
SUPABASE_URL=https://vwjhjmsqyhzlsczmkcri.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_YHggsgTp8NL1QXWebZk0QA_nQk9EQtN
VITE_SUPABASE_URL=https://vwjhjmsqyhzlsczmkcri.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_YHggsgTp8NL1QXWebZk0QA_nQk9EQtN
VITE_SUPABASE_ANON_KEY=sb_publishable_YHggsgTp8NL1QXWebZk0QA_nQk9EQtN
VITE_SUPABASE_PROJECT_ID=vwjhjmsqyhzlsczmkcri
```

### Optional API Keys
```
GEMINI_API_KEY=AQ.Ab8RN6IkQ4Q20sowj1dlxBqkixhItSYriRT5fq7I4e8yQZZtmg
NEWS_API_KEY=pub_ab9ab2fcfa2d4a8791ec4c80e6a72745
GNEWS_API_KEY=e0f52905a5ceefc37e130472fb1cde83
FINNHUB_API_KEY=d8j9jh1r01qgth6j7mcgd8j9jh1r01qgth6j7md0
GROQ_API_KEY=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
FIRECRAWL_API_KEY=
```

---

## Build Output Structure

```
dist/
├── client/              # Static assets (served by CDN)
│   ├── index.html      # SPA entry point
│   ├── assets/         # JS/CSS bundles
│   └── _redirects      # Netlify/Vercel routing
│
└── server/             # Cloudflare Workers output
    ├── index.js        # Worker entry
    ├── wrangler.json   # Worker config
    ├── .vite/          # SSR manifest
    └── assets/         # Server-side bundles
```

---

## Testing Deployment Locally

### Test Vercel Build
```bash
npm run build
vercel build
```

### Test Cloudflare Build
```bash
npm run build
wrangler pages publish dist/client
```

### Test Locally
```bash
npm run build
npm run preview
# Or: vite preview
```

---

## Troubleshooting

### 404 Errors
- ✅ Fixed: index.html now present in dist/client/
- ✅ Fixed: vercel.json configured for SPA fallback
- ✅ Fixed: netlify.toml configured for SPA fallback

### Environment Variable Issues
- Vercel: Variables must be set in Vercel dashboard (not .env)
- Cloudflare: Set in wrangler.jsonc or Cloudflare dashboard
- Client variables must be prefixed with VITE_

### CORS Issues
- Supabase: Public key is safe to expose
- API keys: Keep secure, use environment variables

---

## Deployment Checklist

- [ ] Environment variables set on deployment platform
- [ ] Build completes without errors
- [ ] index.html exists in dist/client/
- [ ] Routes work (/, /login, /dashboard, etc)
- [ ] Authentication works
- [ ] APIs can connect
- [ ] Console has no critical errors

---

## Current Issues Fixed

1. ✅ **Missing index.html** - Created in public/index.html, included in build
2. ✅ **No SPA fallback** - Added rewrites in vercel.json and netlify.toml
3. ✅ **Incomplete vercel.json** - Added full configuration
4. ✅ **Mixed platform configs** - Cleaned up, documented both options
5. ✅ **Build output unclear** - Documented structure, ready for deployment

---

## Next Steps

1. Choose deployment platform (Cloudflare or Vercel)
2. Set environment variables on chosen platform
3. Deploy and test
4. Monitor for errors
5. Scale as needed

**RECOMMENDATION**: Start with **Cloudflare Pages** (already optimized), then add **Vercel** as fallback.
