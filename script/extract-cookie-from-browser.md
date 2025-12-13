# Extract Cookie from Your Browser - Step by Step

## Quick Method (Copy-Paste Ready)

### Step 1: Open OpenRouter
1. Go to: https://openrouter.ai
2. Make sure you're logged in

### Step 2: Open DevTools
- **Mac**: Press `Cmd + Option + I`
- **Windows/Linux**: Press `F12`

### Step 3: Get Cookie String

#### Chrome/Edge:
1. Click **Application** tab at the top
2. Left sidebar: Click **Cookies** → **https://openrouter.ai**
3. You'll see a table with cookies
4. Right-click on any cookie row
5. Look for "Copy" or "Copy all as cURL"
6. If that's not available, manually copy each cookie:
   - Look at the "Name" and "Value" columns
   - Format: `name=value; name2=value2`

#### Firefox:
1. Click **Storage** tab at the top
2. Left sidebar: Click **Cookies** → **https://openrouter.ai**
3. Right-click and copy cookies

### Step 4: Format Your Cookie

Your cookie should look like this:
```
__cf_bm=abc123; _ga=xyz789; session_id=def456
```

All cookies separated by `; ` (semicolon and space)

### Step 5: Add to .env

Run this command and paste your cookie when prompted:
```bash
node script/add-test-cookie.js
```

Or manually edit `.env` file:
```bash
VITE_OPENROUTER_COOKIE="your_cookie_string_here"
```

### Step 6: Test
```bash
node script/test-openrouter-cookie.js
```

### Step 7: Restart Dev Server
```bash
# Stop current server (Ctrl+C)
pnpm dev
```

## Alternative: Use Browser Console

1. Open https://openrouter.ai
2. Open DevTools Console tab
3. Paste this code:
```javascript
document.cookie
```
4. Copy the output
5. Run: `node script/add-test-cookie.js`
6. Paste the cookie string

## Need Help?

If you're having trouble, you can:
1. Take a screenshot of your DevTools → Application → Cookies
2. Or copy the output of `document.cookie` from console
3. Share it (I'll help format it)

**Note**: Never share your actual cookie values publicly - only for testing locally!
