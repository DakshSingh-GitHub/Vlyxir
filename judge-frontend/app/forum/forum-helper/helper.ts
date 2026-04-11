import { supabase } from "../../lib/supabase/client";

// Types
export type ForumPost = {
  id: string;
  channel_id: string;
  author_id: string;
  author_username: string;
  title: string;
  body: string;
  cover_image?: string;
  tags: string[];
  upvotes: number;
  read_time_minutes: number;
  is_pinned: boolean;
  created_at: string;
};

export type ForumChannel = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_starred: boolean;
  created_at: string;
};

export type ForumComment = {
  id: string;
  post_id: string;
  author_id: string;
  author_username: string;
  body: string;
  parent_id?: string;
  created_at: string;
};

// ID Formatting
export function generateForumId(username: string): string {
  const rand = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
  return `${username}:${rand}`;
}

export function parseForumId(forumId: string): { username: string; uid: string } {
  const [username, uid] = forumId.split(':');
  return { username, uid };
}

// Data Fetching Stubs
export async function fetchChannels(): Promise<ForumChannel[]> {
  const { data, error } = await supabase.from('forum_channels').select('*').order('created_at', { ascending: true });
  
  if (error || !data || data.length === 0) {
    if (error) console.error("Error fetching channels:", error);
    // Failover: provide a default channel so users aren't blocked from posting
    return [
      {
        id: "default-general",
        name: "General",
        slug: "general",
        description: "General discussion",
        is_starred: true,
        created_at: new Date().toISOString()
      }
    ];
  }
  return data;
}

export async function fetchPosts(channelId?: string, tab: string = 'All Posts'): Promise<ForumPost[]> {
  let query = supabase.from('forum_posts').select('*');
  
  if (channelId) {
    query = query.eq('channel_id', channelId);
  }

  // Handle sorting based on tab
  if (tab === 'Trending' || tab === 'Fast Growing') {
    query = query.order('upvotes', { ascending: false });
  } else {
    // Default to 'New' or 'All Posts' which is newest first
    query = query.order('created_at', { ascending: false });
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data || [];
}


// Add further stubs like createPost, createComment, votePost down the road.

export async function publishPost(
  title: string,
  body: string,
  channel_id: string,
  tags: string[],
  user: any // Replace with proper User type from your auth context
): Promise<{ data: ForumPost | null; error: Error | null }> {
  if (!user || !user.id) {
    return { data: null, error: new Error("User must be logged in to post.") };
  }

  // Fallback to email prefix if username is not strictly available
  const rawUsername = user.user_metadata?.username || user.email?.split('@')[0] || "user";
  // remove any colons to strictly conform to the format
  const safeUsername = rawUsername.replace(/:/g, '');
  const id = generateForumId(safeUsername);

  // estimate read time (rough estimate: 200 words per minute)
  const wordCount = body.trim().split(/\s+/).length;
  const read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));

  const postPayload = {
    id,
    channel_id,
    author_id: user.id,
    author_username: safeUsername,
    title,
    body,
    tags,
    upvotes: 0,
    read_time_minutes,
    is_pinned: false,
    // created_at is handled by Postgres by default, but you can explicitly add it if needed
  };

  const { data, error } = await supabase
    .from('forum_posts')
    .insert([postPayload])
    .select('*')
    .single();

  return { data, error };
}

export async function fetchPostById(id: string): Promise<ForumPost | null> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching post by ID:", error);
    return null;
  }
  return data;
}

export async function fetchComments(postId: string): Promise<ForumComment[]> {
  const { data, error } = await supabase
    .from('forum_comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
  return data || [];
}

export async function publishComment(
  postId: string,
  body: string,
  user: any,
  parentId?: string
): Promise<{ data: ForumComment | null; error: Error | null }> {
  if (!user || !user.id) {
    return { data: null, error: new Error("User must be logged in to comment.") };
  }

  const rawUsername = user.user_metadata?.username || user.email?.split('@')[0] || "user";
  const safeUsername = rawUsername.replace(/:/g, '');

  const commentPayload = {
    post_id: postId,
    author_id: user.id,
    author_username: safeUsername,
    body,
    parent_id: parentId || null,
  };

  const { data, error } = await supabase
    .from('forum_comments')
    .insert([commentPayload])
    .select('*')
    .single();

  return { data, error };
}

