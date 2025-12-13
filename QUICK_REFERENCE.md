# OpenRouter Cookie Setup - Quick Reference Card

## 🚀 Quick Start (5 Minutes)

### 1. Extract Cookie
```bash
node script/get-openrouter-cookie.js
```
→ Follow prompts to extract cookie from https://openrouter.ai

### 2. Add to .env
```bash
VITE_OPENROUTER_COOKIE="your_cookie_here"
```

### 3. Test
```bash
node script/test-openrouter-cookie.js
```

### 4. Run
```bash
pnpm dev
```

## 📋 Commands

| Command | Purpose |
|---------|---------|
| `node script/get-openrouter-cookie.js` | Extract cookie from browser |
| `node script/test-openrouter-cookie.js` | Test if cookie works |
| `pnpm dev` | Start development server |
| `cat .env` | View environment variables |

## 🔍 Verification

### Check Console
- ✅ `Using OpenRouter` = Working perfectly
- ⚠️ `Using HuggingFace` = Fallback (check cookie)
- ⚠️ `Using Smart Fallback` = Mock mode (check APIs)

### Test AI Chat
1. Open http://localhost:5001
2. Go to any question page
3. Click ✨ Sparkles icon
4. Ask a question
5. Check console for status

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| Cookie test fails | Extract fresh cookie from browser |
| AI not responding | Check console for errors |
| 401 error | Cookie expired, extract new one |
| No .env file | Create it: `touch .env` |
| Changes not working | Restart dev server |

## 📚 Documentation

| File | Purpose |
|------|---------|
| `AI_QUICK_START.md` | 5-minute setup guide |
| `OPENROUTER_SETUP.md` | Complete setup guide |
| `SETUP_CHECKLIST.md` | Step-by-step checklist |
| `AI_FEATURES.md` | Feature documentation |
| `IMPLEMENTATION_SUMMARY.md` | Technical details |

## 🔐 Security

✅ **DO:**
- Keep cookie in .env (gitignored)
- Use GitHub Secrets for production
- Rotate cookie periodically

❌ **DON'T:**
- Commit .env to git
- Share cookie publicly
- Hardcode in source files

## 🌐 Production Setup

### 1. Add GitHub Secret
- Go to: Settings → Secrets → Actions
- Name: `OPENROUTER_COOKIE`
- Value: Your cookie string

### 2. Deploy
```bash
git push origin main
```

### 3. Verify
- Check GitHub Actions logs
- Test on production site
- Verify AI features work

## 🎯 Success Checklist

- [ ] Cookie extracted
- [ ] Added to .env
- [ ] Test script passes
- [ ] Dev server running
- [ ] AI chat works
- [ ] Console shows "Using OpenRouter"
- [ ] GitHub Secret added (for production)
- [ ] Production deployed
- [ ] Production AI works

## 💡 Tips

1. **Cookie expires?** Extract fresh one from browser
2. **Want to test fallback?** Remove cookie from .env
3. **Need help?** Check browser console first
4. **Slow responses?** Check which tier is being used
5. **Production issues?** Verify GitHub Secret is set

## 🔗 Quick Links

- OpenRouter: https://openrouter.ai
- GitHub Actions: `.github/workflows/deploy-pages.yml`
- AI Integration: `client/src/lib/ai.ts`
- Config: `client/src/lib/config.ts`

## 📞 Support

1. Check browser console
2. Run test script
3. Read troubleshooting docs
4. Check GitHub Actions logs
5. Verify cookie validity

---

**Setup Time:** 2-5 minutes  
**Difficulty:** Easy  
**Status:** Ready to use! 🚀
