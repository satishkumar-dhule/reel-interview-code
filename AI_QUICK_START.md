# AI Features Quick Start Guide

Get AI features working in 5 minutes!

## Option 1: Use Without Setup (Fallback Mode)

AI features work out of the box with smart fallbacks:

```bash
pnpm dev
```

Visit any question page and click the ✨ Sparkles icon. You'll get:
- HuggingFace AI responses (free, no setup)
- Smart mock responses (pattern-based)

**No setup needed!** But responses may be slower or less accurate.

## Option 2: Best Quality (OpenRouter - Recommended)

Get the best AI responses with free Mixtral-8x7b model:

### Step 1: Extract Cookie (2 minutes)

```bash
node script/get-openrouter-cookie.js
```

Follow the prompts:
1. Go to https://openrouter.ai (create free account if needed)
2. Open DevTools (F12)
3. Application → Cookies → openrouter.ai
4. Copy all cookies
5. Paste when prompted

### Step 2: Add to .env

The script will output something like:

```bash
VITE_OPENROUTER_COOKIE="cookie1=value1; cookie2=value2"
```

Copy this to your `.env` file (create if it doesn't exist).

### Step 3: Test It

```bash
# Test the cookie
node script/test-openrouter-cookie.js

# If successful, start dev server
pnpm dev
```

### Step 4: Try It Out

1. Open http://localhost:5001
2. Navigate to any question
3. Click the ✨ Sparkles icon
4. Ask a question!

Check browser console:
- `✅ Using OpenRouter` = Success! Best quality
- `✅ Using HuggingFace` = Fallback (cookie issue)
- `✅ Using Smart Fallback` = Mock mode

## Production Deployment

### Add to GitHub Secrets

1. Go to GitHub repo → Settings → Secrets → Actions
2. New secret: `OPENROUTER_COOKIE`
3. Paste your cookie value
4. Push to main branch

The deploy workflow automatically injects the cookie at build time.

## Troubleshooting

### Cookie Not Working?

```bash
# Test the cookie
node script/test-openrouter-cookie.js
```

If it fails:
1. Cookie may have expired - extract a fresh one
2. Make sure you copied the entire cookie string
3. Check for quotes around the value in .env
4. Restart dev server after updating .env

### Still Not Working?

Don't worry! The fallback system ensures AI features always work:
- HuggingFace API (free, no auth)
- Smart mock responses (always works)

## What You Get

### With OpenRouter (Best)
- Mixtral-8x7b model (very smart)
- Fast responses
- Best quality explanations
- Real-time streaming

### With HuggingFace (Good)
- Zephyr-7b model (pretty smart)
- Slower responses
- Good quality explanations
- May have rate limits

### With Fallback (Basic)
- Pattern-based responses
- Instant responses
- Helpful but generic
- Always works

## Need Help?

See full documentation:
- [OPENROUTER_SETUP.md](OPENROUTER_SETUP.md) - Detailed setup guide
- [AI_FEATURES.md](AI_FEATURES.md) - Feature documentation

## Quick Commands

```bash
# Extract cookie
node script/get-openrouter-cookie.js

# Test cookie
node script/test-openrouter-cookie.js

# Start dev server
pnpm dev

# Check logs
# Open browser console and look for "✅ Using..."
```

## Security Note

- Cookie is stored in `.env` (gitignored)
- Never commit `.env` to git
- Cookie only works for your domain (CORS protected)
- Rotate cookie periodically for security

---

**Time to setup**: 2-5 minutes  
**Difficulty**: Easy  
**Worth it**: Absolutely! 🚀
