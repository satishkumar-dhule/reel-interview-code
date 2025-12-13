# AI Features - Setup Required

## Current Configuration

AI features now **require** OpenRouter cookie authentication. There are no fallback options.

## Why This Change?

- HuggingFace has CORS restrictions (blocked in browser)
- Mock responses were not providing real value
- Better to show clear error than fake responses
- Forces proper setup for best experience

## What You'll See Without Setup

If you try to use AI features without configuring OpenRouter:

```
Error: OpenRouter not configured. Please add your cookie to .env file.
See OPENROUTER_SETUP.md for setup instructions or visit 
http://localhost:5001/test/cookie to check configuration.
```

## Quick Setup (2 Minutes)

### 1. Extract Cookie
```bash
node script/add-test-cookie.js
```

Or manually:
1. Go to https://openrouter.ai (create free account)
2. Open DevTools (F12) → Application → Cookies
3. Copy all cookies

### 2. Add to .env
```bash
VITE_OPENROUTER_COOKIE="your_cookie_here"
```

### 3. Restart Server
```bash
# Stop current server (Ctrl+C)
pnpm dev
```

### 4. Test
- Visit http://localhost:5001/test/cookie to check configuration
- Or try AI chat on any question page

## Error Messages

### "OpenRouter not configured"
**Cause**: No cookie in .env file  
**Fix**: Add cookie using steps above

### "Authentication failed" (401)
**Cause**: Cookie invalid or expired  
**Fix**: Extract fresh cookie from browser

### "AI service returned [status]"
**Cause**: OpenRouter API issue  
**Fix**: Wait and try again, or check https://status.openrouter.ai

### "Failed to connect"
**Cause**: Network issue  
**Fix**: Check internet connection

## Check Configuration

Visit: http://localhost:5001/test/cookie

This page shows:
- ✓ Cookie configured or ✗ Not configured
- Cookie length
- Current tier status
- Setup instructions

## Production Deployment

Add cookie to GitHub Secrets:
1. Go to repo Settings → Secrets → Actions
2. Name: `OPENROUTER_COOKIE`
3. Value: Your cookie string
4. Push to deploy

## Documentation

- **Quick Start**: AI_QUICK_START.md
- **Complete Guide**: OPENROUTER_SETUP.md
- **Testing**: TEST_COOKIE_GUIDE.md
- **Checklist**: SETUP_CHECKLIST.md

## Benefits of This Approach

✅ Clear error messages  
✅ Forces proper setup  
✅ Best quality responses (Mixtral-8x7b)  
✅ No confusing fallback behavior  
✅ Easier to debug issues  

## Summary

AI features are now **OpenRouter-only**:
- No HuggingFace fallback (CORS issues)
- No mock responses (not helpful)
- Clear errors guide you to setup
- 2-minute setup for best experience

**Next Step**: Run `node script/add-test-cookie.js` to get started!
