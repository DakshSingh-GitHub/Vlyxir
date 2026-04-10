# Forum — `/forum` Multi-Route Implementation Plan

## Overview

Add a full-featured community **Forums** section as a collection of sub-routes under `/forum`. Inspired by the reference images, each route has a distinct purpose:

| Route | Purpose |
|---|---|
| `/forum` | Main listing — three-panel feed (sidebar + posts + right panel) |
| `/forum/create-post` | Dedicated page for composing a new post |
| `/forum/[forum_id]` | Full post detail view with comments |

### Forum ID Format
Every post gets a unique ID in the format **`<username>:<9_digit_number>`** (e.g. `daksh:482917364`).  
- Generated at post creation time in `helper.ts`  
- Based on the authenticated user's `username` (from `user_metadata`) + `Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0')`  
- Stored as the primary key in the `forum_posts` table  
- URL-safe as-is (colons are valid in URL path segments)

Data will be persisted in **Supabase** (new tables). Auth, theming, and animation patterns follow existing CodeJudge conventions.

---

## User Review Required

> [!NOTE]
> **Data strategy (confirmed): Option A** — Real Supabase persistence using `forum_posts`, `forum_comments`, `forum_channels` tables with the existing `supabase` client from `app/lib/supabase/client.ts`.

> [!NOTE]
> **Navigation placement (confirmed):** Forum is **NOT** in the nav dropdown. Instead it replaces the "Meet Developer" card on the home page and its footer link. The nav dropdown (`NewNavDropdown` / `NavDropdown`) remains unchanged.

---

---

## Route Tree

```
app/
└── forum/
    ├── page.tsx                  ← /forum  (main listing)
    ├── layout.tsx                ← shared shell
    ├── create-post/
    │   └── page.tsx              ← /forum/create-post
    └── [forum_id]/
        └── page.tsx              ← /forum/<username>:<9-digit-id>

app/forum/forum-helper/
    └── helper.ts                 ← all Supabase calls + ID helpers + types

components/forum/                 ← note: lowercase
    ├── ForumLayout.tsx           ← three-column grid wrapper
    ├── ForumSidebar.tsx          ← left panel
    ├── ForumFeed.tsx             ← center post list
    ├── ForumRightPanel.tsx       ← right panel
    ├── ForumTrendingCard.tsx     ← large hero-style trending card
    ├── CreatePostForm.tsx        ← full-page composer form
    ├── PostDetail.tsx            ← post body + comments
    ├── CommentThread.tsx         ← nested comment tree
    └── cards/
        └── ForumPostCard.tsx     ← reusable post row / card  ✅ already created
```

---

## Proposed Changes

### Route 1 — `/forum` (Main Listing)

#### [MODIFY] [page.tsx](file:///c:/Users/daksh/Documents/GitHub/code-judge/judge-frontend/app/forum/page.tsx)
Replace the empty shell. Renders `<ForumLayout>` which composes `ForumSidebar` + `ForumFeed` + `ForumRightPanel`. Fetches channels and initial posts (server component or client with `useEffect`). Includes a floating **"+ New Post"** button that links to `/forum/create-post`.

---

### Route 2 — `/forum/create-post`

#### [NEW] `app/forum/create-post/page.tsx`
Dedicated composer page. Auth-gated — unauthenticated users are redirected to `/login` with a `?redirect=/forum/create-post` param.  
Renders `<CreatePostForm />` centered on the page.

---

### Route 3 — `/forum/[forum_id]`

#### [NEW] `app/forum/[forum_id]/page.tsx`
Dynamic route. Parses `forum_id` param (format `username:123456789`).  
Fetches the specific post + its comments from Supabase.  
Renders `<PostDetail />` + `<CommentThread />`.  
Includes breadcrumb: `Forum → <channel>` linking back to `/forum`.  

> [!NOTE]
> Next.js allows colons in dynamic segment values — the `[forum_id]` folder name handles `username:123456789` natively via `params.forum_id`.

---

### Forum Helper — `app/forum/forum-helper/helper.ts`

#### [MODIFY] [helper.ts](file:///c:/Users/daksh/Documents/GitHub/code-judge/judge-frontend/app/forum/forum-helper/helper.ts)
All Supabase calls + shared types:

```ts
// ID generation
export function generateForumId(username: string): string {
  const rand = Math.floor(Math.random() * 1_000_000_000)
    .toString()
    .padStart(9, '0');
  return `${username}:${rand}`;
}

// Parse back out
export function parseForumId(forumId: string): { username: string; uid: string } {
  const [username, uid] = forumId.split(':');
  return { username, uid };
}

// TypeScript types
export type ForumPost = { id: string; channel_id: string; author_id: string; title: string; body: string; cover_image?: string; tags: string[]; upvotes: number; read_time_minutes: number; is_pinned: boolean; created_at: string; };
export type ForumChannel = { id: string; name: string; slug: string; description?: string; icon?: string; unread_count?: number; };
export type ForumComment = { id: string; post_id: string; author_id: string; body: string; parent_id?: string; created_at: string; };

// Data helpers
export async function fetchPosts(channel?: string, tab?: 'for_you' | 'trending' | 'following'): Promise<ForumPost[]>
export async function fetchPostById(forumId: string): Promise<ForumPost | null>
export async function fetchChannels(): Promise<ForumChannel[]>
export async function fetchComments(postId: string): Promise<ForumComment[]>
export async function createPost(data: Omit<ForumPost, 'id' | 'upvotes' | 'created_at'>, username: string): Promise<string>  // returns new forumId
export async function createComment(data: Omit<ForumComment, 'id' | 'created_at'>): Promise<void>
export async function votePost(forumId: string, direction: 'up' | 'down'): Promise<void>
```

---

---

### Forum UI Components

All new components go in `/components/Forum/`:

#### [NEW] `ForumLayout.tsx`
Top-level three-column grid wrapper (`sidebar | feed | right-panel`). Responsive: sidebar collapses on mobile, right panel hides on medium screens. Used by `/forum` only (detail and create pages have their own layouts).

#### [NEW] `ForumSidebar.tsx`
Left panel with:
- Search within channels
- Navigation items (Home, Trending, Pinned) — links to `/forum?tab=...`
- Link to **Create Post** → `/forum/create-post`
- **Starred** channels section (with unread badge counts)
- **Channels** section (collapsible, `+` add button placeholder)
- Active channel highlight / hover states
- Fully theme-aware (dark/light via `useAppContext`)

#### [NEW] `ForumFeed.tsx`
Center panel with:
- Search bar + notification bell (header row)
- Category pills/chips (scrollable horizontal)
- Tab switcher — **For You** / **Trending** / **Following**
- **Trending cards** (`ForumTrendingCard`) — large visual cards for top 2 posts with `Trending #N` badge
- **Standard post rows** (`ForumPostCard`) — thumbnail, author, tag, title, excerpt, date, read time, bookmark
- Each card/row navigates to `/forum/<forum_id>` on click
- Skeleton loading states during fetch
- "Load more" button (or infinite scroll)

#### [NEW] `cards/ForumPostCard.tsx` ✅ _(already exists)_
Reusable compact post row used in the feed and right panel. Props: post data + optional `variant` ("row" | "curated"). Clicking navigates to `/forum/<forum_id>`.

#### [NEW] `ForumTrendingCard.tsx` _(at `components/forum/` root)_
Large hero card with full-bleed image, gradient overlay, author pill, title, excerpt. Clicking navigates to `/forum/<forum_id>`. Badge: `Trending #1` / `Trending #2`.

#### [NEW] `ForumRightPanel.tsx`
Right panel with:
- **Curated Picks** — 3 `ForumPostCard` (curated variant)
- **Categories** — tag cloud of clickable pills (filter the feed)
- **Recommended Follows** — user rows with `Follow +` button (UI-only for now)

#### [NEW] `CreatePostForm.tsx`
Full-page composer used by `/forum/create-post`:
- Fields: **Title**, **Channel** (dropdown), **Body** (textarea with markdown preview toggle), **Tags** (comma-separated), **Cover image URL**
- Character/word count indicator
- On submit: calls `createPost()` → generates `forum_id` via `generateForumId(username)` → redirects to `/forum/<new_forum_id>`
- Cancel → back to `/forum`

#### [NEW] `PostDetail.tsx`
Full post body view used by `/forum/[forum_id]`:
- Hero image, channel breadcrumb, title, author + date, read time
- Rendered body (markdown via a lightweight renderer, e.g. `react-markdown` if already available, else plain `<pre>`)
- Upvote / downvote counter
- Share + bookmark actions

#### [NEW] `CommentThread.tsx`
Nested comment list used by `/forum/[forum_id]`:
- Renders comments recursively (parent → children indented)
- "Reply" button on each comment (auth-gated)
- Inline comment compose box at the bottom

---

### Home Page & Footer — Replace "Meet Developer" with "Forum"

#### [MODIFY] [page.tsx](file:///c:/Users/daksh/Documents/GitHub/code-judge/judge-frontend/app/page.tsx)
The 4th card in the platform grid currently links to `/meet-developer` with a **Coffee** icon and amber accent.  
Replace it with a **Forum** card:
- `href` → `/forum`
- Icon → `MessageSquare` (or `Users`) from `lucide-react`, accent color → **violet** (`violet-500/600`)
- Title → `"Community Forum"`
- Body → `"Ask questions, share solutions, and connect with other developers."`
- CTA → `"Join the discussion"`

The `meet-developer` route/page itself is **not deleted** — only its home-page card and footer link are replaced. (The URL can remain accessible via direct link.)

#### [MODIFY] [Footer.tsx](file:///c:/Users/daksh/Documents/GitHub/code-judge/judge-frontend/components/General/Footer.tsx)
Line 25: replace the `Meet Developer` `<Link>` with a `Forum` link:
```tsx
// Before
<Link href="/meet-developer" ...>Meet Developer</Link>
// After
<Link href="/forum" ...>Forum</Link>
```

#### [MODIFY] [ClientLayout.tsx](file:///c:/Users/daksh/Documents/GitHub/code-judge/judge-frontend/components/General/ClientLayout.tsx)
The `excludedPaths` list (line 15) controls which paths hide the top nav bar. `/forum` and its sub-routes should **show** the navbar — no changes needed here (they are not in the exclude list by default).

---

---

### Supabase Schema (Option A)

#### New tables in Supabase dashboard / migration:

```sql
-- Channels
create table forum_channels (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  icon text,
  is_starred boolean default false,
  created_at timestamptz default now()
);

-- Posts  (id = "username:123456789" format)
create table forum_posts (
  id text primary key,               -- e.g. "daksh:482917364"
  channel_id uuid references forum_channels(id),
  author_id uuid references auth.users(id),
  author_username text not null,     -- denormalized for display + URL construction
  title text not null,
  body text,
  cover_image text,
  tags text[],
  upvotes int default 0,
  read_time_minutes int default 2,
  is_pinned boolean default false,
  created_at timestamptz default now()
);

-- Comments
create table forum_comments (
  id uuid primary key default gen_random_uuid(),
  post_id text references forum_posts(id) on delete cascade,
  author_id uuid references auth.users(id),
  author_username text not null,
  body text not null,
  parent_id uuid references forum_comments(id),
  created_at timestamptz default now()
);
```

#### Row-Level Security (RLS) — run after creating the tables:

```sql
-- ─────────────────────────────────────────
-- Enable RLS on all three tables
-- ─────────────────────────────────────────
alter table forum_channels enable row level security;
alter table forum_posts    enable row level security;
alter table forum_comments enable row level security;

-- ─────────────────────────────────────────
-- forum_channels
-- Anyone can read channels; only admins can insert/update/delete
-- (channels are managed manually in the Supabase dashboard)
-- ─────────────────────────────────────────
create policy "channels: public read"
  on forum_channels for select
  using (true);

-- ─────────────────────────────────────────
-- forum_posts
-- ─────────────────────────────────────────
create policy "posts: public read"
  on forum_posts for select
  using (true);

create policy "posts: authenticated insert"
  on forum_posts for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "posts: owner update"
  on forum_posts for update
  to authenticated
  using  (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "posts: owner delete"
  on forum_posts for delete
  to authenticated
  using (auth.uid() = author_id);

-- ─────────────────────────────────────────
-- forum_comments
-- ─────────────────────────────────────────
create policy "comments: public read"
  on forum_comments for select
  using (true);

create policy "comments: authenticated insert"
  on forum_comments for insert
  to authenticated
  with check (auth.uid() = author_id);

create policy "comments: owner update"
  on forum_comments for update
  to authenticated
  using  (auth.uid() = author_id)
  with check (auth.uid() = author_id);

create policy "comments: owner delete"
  on forum_comments for delete
  to authenticated
  using (auth.uid() = author_id);
```

> [!IMPORTANT]
> The `forum_posts.id` is a `text` primary key (not a UUID) because it uses the `username:9digit` format. The Supabase client query is simply `.from('forum_posts').select().eq('id', forumId)`.
>
> `upvotes` increments via a Supabase **RPC function** (or a `+= 1` update) owned by authenticated users — the `owner update` policy above covers this since the vote logic will be a separate RPC that bypasses RLS, or you can add a dedicated `posts: authenticated vote` policy scoped to only the `upvotes` column.

---

### Design System

The forum page will follow the existing CodeJudge aesthetic:
- **Dark mode**: `bg-slate-900/slate-950`, `border-slate-700/60`, glassmorphism cards
- **Light mode**: `bg-white/slate-50`, `border-slate-200`, subtle shadows
- **Accent**: Indigo (`indigo-500`) for active states / CTAs, matching the rest of the app
- **Animations**: `anime.js` entry animations (fade + translateY) on sidebar items and cards
- **Typography**: Geist Sans (already loaded globally)
- **Trending card images**: `next/image` with `object-cover`, overlay gradient for text legibility

---

## Open Questions

> [!NOTE]
> - Should the right panel's **Recommended Follows** show actual CodeJudge users from Supabase `auth.users`, or be hardcoded placeholder data? (A following/follower system will be implemented later as a separate feature.)
> - Is `react-markdown` already available, or should post bodies be rendered as plain text for now?

---

## Verification Plan

### Build Check
```bash
cd judge-frontend && npm run build
```

### Browser Testing
- `/forum` — three-panel layout in dark + light, nav dropdown active state
- `/forum/create-post` — form renders, auth redirect works for guests
- `/forum/<username>:123456789` — post detail + comments load, breadcrumb links back
- Responsive: sidebar collapses on mobile, right panel hides on `< lg`
- Nav dropdown: Forum entry appears, highlights correctly on all sub-routes

### Manual Verification
- Full post creation flow: fill form → submit → land on `/forum/<new_id>`
- Comment flow: add a comment on a post detail page
- Auth-gated actions (create post, comment, vote) redirect unauthenticated users to `/login?redirect=...`
- Existing routes (Code Judge, Code IDE, Code Analysis) completely unaffected
