X API (as of April 27, 2026) gives you programmatic access to X’s public conversation via modern REST endpoints (primarily X API v2). It supports reading posts, publishing content, managing users/relationships, sending DMs, handling lists/spaces/communities, trends, media uploads, compliance, and more. All endpoints are available under the current pay-per-use model (credit-based, no fixed monthly subscriptions for new setups). Legacy Basic/Pro plans still exist for some users but can be switched to pay-per-use in the Developer Console.
Full Capabilities (Main Resource Categories)
The API is organized around these core resource types (all under https://api.x.com/2/...):

Posts — Search (recent/all), post counts, filtered stream, timelines, lookup by ID, bookmarks, manage (create/delete/update), reposts, quotes, hide replies.
Users — Lookup, search, follows/followers, mutes, blocks, affiliates.
Direct Messages (DMs) — Manage (send), lookup, blocks.
Lists — Lookup lists/posts, manage lists, list members, pinned lists.
Spaces — Lookup, search.
Communities — Lookup, search.
Trends — General and personalized trends.
Media — Upload media + metadata.
Compliance — Batch compliance, compliance streams (for deletions etc.).
Enterprise-only (separate plan) — Advanced analytics, volume streams, likes streams, Powerstream, account activity, filtered stream webhooks.

Key features:

Granular field selection (fields parameter) and expansions for related objects.
Post annotations (topics, people, places), conversation threading (conversation_id), edit history.
Real-time streaming (Filtered Stream).
Engagement metrics (public + private for own posts).
Deduplication within 24h UTC (same resource often free on repeat requests).

Limitations: Rate limits and pricing are per-endpoint/resource (see below). Enterprise features require a separate high-tier plan. Legacy v1.1 endpoints are deprecated/not updated.
Current Pricing (Pay-Per-Use, Credit-Based)
You buy credits upfront in the Developer Console. No monthly caps or subscriptions—pay only for what you use. Auto-recharge and spending limits are available. Purchasing X API credits also gives free xAI API credits (up to 20% back based on spend).
Approximate costs (per resource returned for reads; per request for writes; exact rates always in console):

Reads:
Posts: $0.005/resource
Users/Following/Followers/DMs: $0.010/resource
Lists/Spaces/Communities/Media/Trends/Analytics: $0.005–$0.010/resource

Writes:
Create post: $0.015 (or $0.20 if includes URL)
DM/User interactions: $0.015
Most manages/deletes/bookmarks: $0.005–$0.010

Owned Reads discount (your own data, authenticated user owns the app): $0.001 per resource on many personal endpoints (own tweets, mentions, likes, bookmarks, followers, following, lists, etc.). Effective since the April 20, 2026 update.

Legacy tiers (if you still have them): Basic (~$100–200/mo) and Pro (~$5,000/mo) offer fixed access with approximate monthly limits; you can switch to pay-per-use anytime.
How to Get Access

Go to console.x.com, sign in with your X account, accept the Developer Agreement.
Create a new App → generate API Key + Secret (and Access Token + Secret for user context).
Save credentials securely (they appear only once).
For production: set up billing and purchase credits.

Programmatic Access in a BunJS + Hono Project
BunJS (modern JS runtime) works excellently here — it has native fetch, built-in TypeScript support, and full npm compatibility. Hono is a lightweight, fast web framework perfect for this.
Recommended approach: Official TypeScript SDK (@xdevplatform/xdk)
It provides full type safety, automatic pagination, streaming support, and handles all auth methods. It works seamlessly with Bun (explicitly confirmed in community examples).
1. Setup in Your Bun + Hono Project
Bash# In your project root
bun init -y          # if starting fresh
bun add hono @xdevplatform/xdk
bun add -d @types/bun  # optional, Bun has great TS support out of the box
2. Basic Hono Server Example (src/index.ts)
TypeScriptimport { Hono } from 'hono';
import { Client, type ClientConfig } from '@xdevplatform/xdk';

const app = new Hono();

// Option A: App-only (Bearer Token) — perfect for public read-only operations
const appOnlyConfig: ClientConfig = {
  bearerToken: Bun.env.X_BEARER_TOKEN!,  // from console.x.com
};
const appOnlyClient = new Client(appOnlyConfig);

// Option B: User context (OAuth 1.0a or OAuth 2.0) — required for posting, liking, DMs, follows, etc.
const userContextConfig: ClientConfig = {
  // For OAuth 1.0a (most common for writes):
  apiKey: Bun.env.X_API_KEY!,
  apiSecret: Bun.env.X_API_SECRET!,
  accessToken: Bun.env.X_ACCESS_TOKEN!,      // user-specific
  accessTokenSecret: Bun.env.X_ACCESS_TOKEN_SECRET!,
  
  // Or for OAuth 2.0 user context (Authorization Code + PKCE):
  // clientId, clientSecret, accessToken (short-lived), refreshToken, etc.
};

const userClient = new Client(userContextConfig);

// Example route: Fetch user by username (app-only works here)
app.get('/user/:username', async (c) => {
  const { username } = c.req.param();
  try {
    const response = await appOnlyClient.users.getByUsername(username);
    return c.json(response);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

// Example route: Post a tweet (requires user context / OAuth 1.0a or 2.0)
app.post('/tweet', async (c) => {
  const { text } = await c.req.json();
  try {
    const response = await userClient.tweets.create({ text });
    return c.json(response);
  } catch (error) {
    return c.json({ error: (error as Error).message }, 500);
  }
});

export default app;
Run it:
Bashbun run --hot src/index.ts
3. Authentication Details (Critical for Writes)

App-only (Bearer Token): Read-only public data (search, user lookup, trends, etc.). Generate in console or via POST /oauth2/token.
User context (required for posting, liking, DMs, follows, etc.):
OAuth 1.0a (still widely used and fully supported by the SDK): Uses API Key/Secret + Access Token/Secret. Generate tokens for your own account in the console or via 3-legged flow for other users. Every request is signed with HMAC-SHA1.
OAuth 2.0 Authorization Code Flow with PKCE: More modern, scope-based, better for multi-device/user flows. SDK supports it too.

Store user tokens securely (e.g., in a database per user). Never expose secrets.

The SDK handles signing automatically — you just pass the config.
4. Alternative: Raw Fetch (No SDK)
If you prefer no dependencies:
TypeScriptconst response = await fetch('https://api.x.com/2/tweets', {
  method: 'POST',
  headers: {
    'Authorization': `OAuth ...`, // or Bearer
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ text: 'Hello from Bun + Hono!' }),
});
5. Tips for Production (Hono + Bun)

Use environment variables (Bun.env) or Hono’s middleware for auth.
For user OAuth flow on your frontend → backend: implement the redirect/consent flow yourself or use the SDK helpers.
Handle pagination/streaming (SDK makes this trivial).
Monitor usage in the Developer Console (real-time credit spend).
Comply with Developer Guidelines (no spam, respect rate limits, handle deletions via compliance streams).

Official resources (always check these for the absolute latest):

Docs: https://docs.x.com/x-api/overview
Developer Console: https://console.x.com
TypeScript SDK docs & samples: https://docs.x.com/xdks/typescript/overview + GitHub samples
OpenAPI spec: https://api.x.com/2/openapi.json (great for generating custom clients)

This setup gives you full access today. Start small with the SDK — it’s the fastest way in a Bun + Hono stack. Let me know if you need a specific endpoint example or full OAuth flow code!