import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AI_CONFIG, isOpenRouterConfigured } from "@/lib/config";

export default function CookieTest() {
  const cookieLength = AI_CONFIG.openRouterCookie?.length || 0;
  const isConfigured = isOpenRouterConfigured();

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Cookie Configuration Test</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Environment Variable Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">VITE_OPENROUTER_COOKIE</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              cookieLength > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
              {cookieLength > 0 ? '✓ Set' : '✗ Empty'}
            </span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">Cookie Length</span>
            <span className="font-mono">{cookieLength} characters</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <span className="font-medium">OpenRouter Configured</span>
            <span className={`px-3 py-1 rounded-full text-sm ${
              isConfigured ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'
            }`}>
              {isConfigured ? '✓ Yes' : '✗ No'}
            </span>
          </div>

          {cookieLength > 0 && (
            <div className="p-4 bg-muted rounded-lg">
              <span className="font-medium block mb-2">Cookie Preview</span>
              <code className="text-xs break-all">
                {AI_CONFIG.openRouterCookie.substring(0, 100)}...
              </code>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>AI Service Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className={`p-4 rounded-lg border-2 ${
            isConfigured ? 'border-green-500 bg-green-50 dark:bg-green-950' : 'border-red-500 bg-red-50 dark:bg-red-950'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold">OpenRouter (Mixtral-8x7b)</div>
                <div className="text-sm text-muted-foreground">
                  {isConfigured ? 'Configured and Ready' : 'Not Configured - Setup Required'}
                </div>
              </div>
              <div className={`text-2xl ${isConfigured ? 'text-green-500' : 'text-red-500'}`}>
                {isConfigured ? '✓' : '✗'}
              </div>
            </div>
          </div>

          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-2">⚠️ Important</p>
            <p className="text-sm text-muted-foreground">
              AI features require OpenRouter cookie authentication. There are no fallback options.
              {!isConfigured && ' Please configure OpenRouter to use AI features.'}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isConfigured ? (
            <>
              <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200">
                <p className="font-medium mb-2">❌ Setup Required</p>
                <p className="text-sm text-muted-foreground mb-3">
                  AI features will not work without OpenRouter configuration. Follow these steps:
                </p>
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Run: <code className="bg-muted px-2 py-1 rounded">node script/add-test-cookie.js</code></li>
                  <li>Go to https://openrouter.ai and log in</li>
                  <li>Extract cookie from DevTools (F12 → Application → Cookies)</li>
                  <li>Paste when prompted</li>
                  <li>Restart dev server</li>
                  <li>Refresh this page</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200">
              <p className="font-medium mb-2">✅ Ready to Use!</p>
              <p className="text-sm text-muted-foreground">
                OpenRouter is configured with Mixtral-8x7b model.
                Try it out by clicking the ✨ Sparkles icon on any question page.
              </p>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Documentation:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>AI_SETUP_REQUIRED.md - Why setup is required</li>
              <li>AI_QUICK_START.md - Quick setup (2 minutes)</li>
              <li>OPENROUTER_SETUP.md - Complete guide</li>
              <li>TEST_COOKIE_GUIDE.md - Testing guide</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
