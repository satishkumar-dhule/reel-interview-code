# OpenRouter Cookie Authentication Setup

This guide explains how to set up OpenRouter cookie authentication for AI features.

## Why Cookie Authentication?

OpenRouter offers free AI models (like Mixtral-8x7b) that don't require API keys, but they do require browser cookie authentication. This is perfect for our use case since we want free AI features without managing API keys.

## Local Development Setup

### Step 1: Extract Cookie from Browser

1. Open your browser and go to https://openrouter.ai
2. Log in or create a free account
3. Open DevTools:
   - Chrome/Edge: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
   - Firefox: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
4. Go to the **Application** tab (Chrome) or **Storage** tab (Firefox)
5. In the left sidebar, expand **Cookies** and click on `https://openrouter.ai`
6. You'll see a list of cookies. Copy the entire cookie string in this format:
   ```
   cookie_name1=value1; cookie_name2=value2; cookie_name3=value3
   ```

### Step 2: Use the Helper Script (Optional)

We provide a helper script to guide you through the process:

```bash
node script/get-openrouter-cookie.js
```

Follow the prompts and paste your cookies when asked.

### Step 3: Add to .env File

Create or edit the `.env` file in the project root:

```bash
VITE_OPENROUTER_COOKIE="your_cookie_string_here"
```

**Important**: 
- Keep the quotes around the cookie string
- Never commit this file to git (it's already in `.gitignore`)
- The cookie may expire after some time, so you might need to refresh it

### Step 4: Test Locally

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to any question page (e.g., http://localhost:5001/channel/devops/3)

3. Click the **Sparkles** icon (✨) in the top right to open AI chat

4. Try asking a question. Check the browser console:
   - If you see `✅ Using OpenRouter` - Success! Cookie auth is working
   - If you see `✅ Using HuggingFace` - Fallback to HuggingFace API
   - If you see `✅ Using Smart Fallback` - Using mock responses

## GitHub Actions Setup (Production)

### Step 1: Add Repository Secret

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `OPENROUTER_COOKIE`
5. Value: Paste your cookie string (same as in `.env`)
6. Click **Add secret**

### Step 2: Verify Workflow Configuration

The deploy workflow (`.github/workflows/deploy-pages.yml`) is already configured to inject the cookie:

```yaml
env:
  VITE_OPENROUTER_COOKIE: ${{ secrets.OPENROUTER_COOKIE }}
```

This makes the cookie available during the build process, and Vite will embed it in the production bundle.

### Step 3: Deploy

Push to main branch or manually trigger the deploy workflow:

```bash
git push origin main
```

Or use GitHub Actions UI to manually trigger the workflow.

## How It Works

### 3-Tier Fallback System

The AI integration uses a smart fallback system:

1. **OpenRouter** (Primary - if cookie configured)
   - Free models like Mixtral-8x7b
   - Best quality responses
   - Requires cookie authentication

2. **HuggingFace Inference API** (Secondary)
   - Free, no authentication needed
   - Good quality responses
   - May have rate limits

3. **Smart Mock Responses** (Tertiary)
   - Always works
   - Pattern-based responses
   - Good for testing and demos

### Cookie Security

**Local Development:**
- Cookie stored in `.env` file (gitignored)
- Only accessible on your machine

**Production:**
- Cookie stored as GitHub Secret (encrypted)
- Injected at build time
- Embedded in production bundle
- Only works for your domain (CORS protection)

**Note**: While the cookie is embedded in the client bundle, it's protected by:
- CORS headers (only works from your domain)
- HTTP-Referer validation
- OpenRouter's rate limiting per cookie

## Troubleshooting

### "No cookie auth credentials found" Error

**Cause**: Cookie not configured or invalid

**Solutions**:
1. Check if `.env` file exists and has `VITE_OPENROUTER_COOKIE`
2. Verify cookie format (should be `name=value; name2=value2`)
3. Cookie may have expired - extract a fresh one from browser
4. Restart dev server after updating `.env`

### Cookie Expires

**Symptoms**: AI features stop working after some time

**Solution**: 
1. Log into https://openrouter.ai again
2. Extract fresh cookie from browser
3. Update `.env` file locally
4. Update GitHub Secret for production
5. Redeploy

### AI Features Not Working

**Check Console Logs**:
- `✅ Using OpenRouter` - Working correctly
- `✅ Using HuggingFace` - Fallback working (cookie issue)
- `✅ Using Smart Fallback` - Both APIs failed (check network)

**Debug Steps**:
1. Open browser DevTools → Console
2. Try AI chat feature
3. Look for error messages
4. Check Network tab for failed requests
5. Verify cookie in Application → Cookies

## Testing the Setup

### Quick Test Script

```bash
# Test cookie extraction
node script/get-openrouter-cookie.js

# Test API with curl (replace YOUR_COOKIE with actual cookie)
curl 'https://openrouter.ai/api/v1/chat/completions' \
  -H 'Content-Type: application/json' \
  -H 'Cookie: YOUR_COOKIE' \
  --data-raw '{
    "model":"mistralai/mixtral-8x7b-instruct:free",
    "messages":[{"role":"user","content":"Hello"}]
  }'
```

### Expected Response

Success (200):
```json
{
  "choices": [{
    "message": {
      "content": "Hello! How can I help you today?"
    }
  }]
}
```

Failure (401):
```json
{
  "error": {
    "message": "No cookie auth credentials found",
    "code": 401
  }
}
```

## AI Features Available

Once configured, users can:

1. **Ask Follow-up Questions** - Get clarification on any concept
2. **Mock Interview** - Practice answering and get feedback
3. **Concept Explainer** - Break down complex topics
4. **Code Review** - Get feedback on solution approaches
5. **Related Questions** - Discover similar interview questions
6. **Progressive Hints** - Get hints without spoiling the answer

## Maintenance

### Regular Tasks

- **Monthly**: Check if cookie is still valid
- **After Login**: Update cookie if you log into OpenRouter again
- **Before Deploy**: Verify GitHub Secret is up to date

### Monitoring

Check GitHub Actions logs for:
- Build success/failure
- Environment variable injection
- Deploy status

## Security Best Practices

✅ **DO**:
- Keep cookie in `.env` (gitignored)
- Use GitHub Secrets for production
- Rotate cookie periodically
- Monitor usage on OpenRouter dashboard

❌ **DON'T**:
- Commit `.env` to git
- Share cookie publicly
- Use same cookie across multiple projects
- Hardcode cookie in source files

## Support

If you encounter issues:

1. Check this guide first
2. Review console logs in browser DevTools
3. Test with curl command above
4. Check OpenRouter status: https://status.openrouter.ai
5. Verify GitHub Actions logs

## Alternative: Using API Key

If you prefer using an API key instead of cookies:

1. Get API key from https://openrouter.ai/keys
2. Update `client/src/lib/ai.ts` to use `Authorization: Bearer YOUR_KEY`
3. Add `VITE_OPENROUTER_API_KEY` to `.env` and GitHub Secrets

Note: Free models may not work with API keys, so cookie auth is recommended.
