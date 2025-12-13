# OpenRouter Cookie Setup Checklist

Quick checklist to get AI features working with best quality.

## ☐ Local Development Setup

### Step 1: Extract Cookie
```bash
node script/get-openrouter-cookie.js
```

- [ ] Go to https://openrouter.ai
- [ ] Log in (or create free account)
- [ ] Open DevTools (F12)
- [ ] Navigate to Application → Cookies → openrouter.ai
- [ ] Copy all cookies
- [ ] Paste into script when prompted

### Step 2: Add to .env
- [ ] Create/edit `.env` file in project root
- [ ] Add line: `VITE_OPENROUTER_COOKIE="your_cookie_here"`
- [ ] Save file

### Step 3: Test Cookie
```bash
node script/test-openrouter-cookie.js
```

- [ ] Script shows "✅ Success! OpenRouter is working!"
- [ ] If failed, extract fresh cookie and try again

### Step 4: Test in Browser
```bash
pnpm dev
```

- [ ] Open http://localhost:5001
- [ ] Navigate to any question page
- [ ] Click ✨ Sparkles icon
- [ ] Ask a question
- [ ] Check console for "✅ Using OpenRouter"

## ☐ Production Deployment Setup

### Step 1: Add GitHub Secret
- [ ] Go to GitHub repo → Settings
- [ ] Click Secrets and variables → Actions
- [ ] Click "New repository secret"
- [ ] Name: `OPENROUTER_COOKIE`
- [ ] Value: Your cookie string (same as .env)
- [ ] Click "Add secret"

### Step 2: Verify Workflow
- [ ] Check `.github/workflows/deploy-pages.yml` has `VITE_OPENROUTER_COOKIE` in env

### Step 3: Deploy
```bash
git push origin main
```

- [ ] Push to main branch
- [ ] Or manually trigger deploy workflow
- [ ] Wait for deployment to complete
- [ ] Test AI features on production site

## ☐ Verification

### Local
- [ ] Dev server running
- [ ] AI chat opens when clicking ✨
- [ ] Console shows "✅ Using OpenRouter"
- [ ] AI responses are fast and high quality

### Production
- [ ] Site deployed successfully
- [ ] AI chat works on production
- [ ] No console errors
- [ ] Responses are high quality

## ☐ Optional: Test Fallback System

### Test HuggingFace Fallback
- [ ] Temporarily remove cookie from .env
- [ ] Restart dev server
- [ ] Test AI chat
- [ ] Console shows "✅ Using HuggingFace"

### Test Mock Fallback
- [ ] Disconnect internet (or block APIs)
- [ ] Test AI chat
- [ ] Console shows "✅ Using Smart Fallback"
- [ ] Responses are still helpful

## Troubleshooting

### ❌ Cookie test fails
- [ ] Extract fresh cookie from browser
- [ ] Check for typos in .env
- [ ] Verify you're logged into openrouter.ai
- [ ] Restart dev server

### ❌ AI not working in browser
- [ ] Check browser console for errors
- [ ] Verify .env file exists
- [ ] Restart dev server after .env changes
- [ ] Clear browser cache

### ❌ Production deployment fails
- [ ] Verify GitHub Secret is set correctly
- [ ] Check GitHub Actions logs
- [ ] Ensure secret name is exactly `OPENROUTER_COOKIE`
- [ ] Re-deploy after fixing

## Quick Commands

```bash
# Extract cookie
node script/get-openrouter-cookie.js

# Test cookie
node script/test-openrouter-cookie.js

# Start dev server
pnpm dev

# Check if .env exists
cat .env

# View GitHub Actions logs
# Go to: https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

## Documentation

- [ ] Read `AI_QUICK_START.md` for quick setup
- [ ] Read `OPENROUTER_SETUP.md` for detailed guide
- [ ] Read `AI_FEATURES.md` for feature documentation
- [ ] Read `COOKIE_AUTH_SETUP_COMPLETE.md` for technical details

## Success Criteria

✅ **Local Development:**
- Cookie test passes
- Dev server runs without errors
- AI chat opens and responds
- Console shows "Using OpenRouter"

✅ **Production:**
- GitHub Secret configured
- Deploy workflow succeeds
- AI features work on live site
- No console errors

## Time Estimate

- **Local Setup**: 2-5 minutes
- **Production Setup**: 2-3 minutes
- **Total**: ~5-10 minutes

## Need Help?

1. Check browser console for error messages
2. Run test script: `node script/test-openrouter-cookie.js`
3. Read troubleshooting in `OPENROUTER_SETUP.md`
4. Verify cookie hasn't expired (extract fresh one)
5. Check GitHub Actions logs for deployment issues

## Alternative: Skip Cookie Setup

Don't want to set up cookies? AI features still work with:
- HuggingFace API (free, no auth)
- Smart mock responses (always works)

Just run `pnpm dev` and start using AI features!

---

**Status**: ☐ Not Started | ⏳ In Progress | ✅ Complete

Mark items as you complete them!
