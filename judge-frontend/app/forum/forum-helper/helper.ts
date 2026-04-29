import { supabase } from "../../lib/supabase/client";
import leoProfanity from "leo-profanity";


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
  comment_count?: number;
  upvotes_count?: number;
  has_upvoted?: boolean;
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
  likes_count?: number;
  has_liked?: boolean;
};

// ID Formatting
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')        // Trim - from start of text
    .replace(/-+$/, '');       // Trim - from end of text
}

export function generateForumId(username: string, title?: string): string {
  const rand = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
  if (title) {
    const slug = slugify(title);
    return slug ? `${username}:${slug}-${rand}` : `${username}:${rand}`;
  }
  return `${username}:${rand}`;
}

export function parseForumId(forumId: string): { username: string; uid: string } {
  const [username, uid] = forumId.split(':');
  return { username, uid };
}

// Data Fetching Stubs
export async function fetchChannels(): Promise<ForumChannel[]> {
  const { data, error } = await supabase.from('forum_channels').select('*').order('created_at', { ascending: true });
  
  let channels: ForumChannel[] = data || [];

  if (error || !data || data.length === 0) {
    if (error) console.error("Error fetching channels:", error);
    // Failover: provide a default channel so users aren't blocked from posting
    channels = [
      {
        id: "default-general",
        name: "General",
        slug: "general",
        description: "General discussion",
        is_starred: true,
        created_at: new Date().toISOString()
      },
      {
        id: "default-questions",
        name: "Questions",
        slug: "questions",
        description: "Ask and answer community questions",
        is_starred: false,
        created_at: new Date().toISOString()
      }
    ];
  } else {
    // If we have data from the DB, ensure "Questions" is included for the user's request
    const hasQuestions = channels.some(c => c.name.toLowerCase() === "questions");
    if (!hasQuestions) {
      channels.push({
        id: "channel-questions-fallback",
        name: "Questions",
        slug: "questions",
        description: "Ask and answer community questions",
        is_starred: false,
        created_at: new Date().toISOString()
      });
    }
  }
  
  return channels;
}

export async function fetchPosts(
  channelId?: string, 
  tab: string = 'All Posts', 
  searchQuery?: string,
  currentUserId?: string
): Promise<ForumPost[]> {
  let query = supabase.from('forum_posts').select(`
    *,
    forum_comments(count),
    forum_post_upvotes(count)${currentUserId ? `, user_vote:forum_post_upvotes(post_id, user_id)` : ''}
  `);
  
  if (currentUserId) {
    // Note: We'll filter the user_vote join to ONLY the current user in the mapping step 
    // because Supabase simple relational selects don't easily support cross-filtering in a single select query 
    // without complex JSON logic OR separate calls. 
    // For this context, fetching the upvote count and checking status is best.
  }

  if (channelId) {
    query = query.eq('channel_id', channelId);
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`);
  }

  // Handle sorting based on tab
  if (tab === 'Trending' || tab === 'Fast Growing') {
    query = query.order('upvotes', { ascending: false });
  } else {
  // Default to 'New' or 'All Posts' which is newest first
    query = query.order('created_at', { ascending: false });
  }

  // Include comment counts (re-applying just in case query was reset)
  // query = query.select('*, forum_comments(count), forum_post_upvotes(count)');

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  
  return (data || []).map((post: any) => {
    if (!post) return null;
    return {
      ...post,
      comment_count: post.forum_comments?.[0]?.count || 0,
      upvotes_count: post.forum_post_upvotes?.[0]?.count || 0,
      has_upvoted: currentUserId ? (post.user_vote || []).some((v: any) => v.user_id === currentUserId) : false
    };
  }).filter(Boolean) as ForumPost[];
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
  const id = generateForumId(safeUsername, title);

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

export async function fetchPostById(id: string, currentUserId?: string): Promise<ForumPost | null> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select(`
      *, 
      forum_comments(count), 
      forum_post_upvotes(count)${currentUserId ? `, user_vote:forum_post_upvotes(post_id, user_id)` : ''}
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    if (error) console.error("Error fetching post by ID:", error);
    return null;
  }
  
  return {
    ...(data as any),
    comment_count: (data as any).forum_comments?.[0]?.count || 0,
    upvotes_count: (data as any).forum_post_upvotes?.[0]?.count || 0,
    has_upvoted: currentUserId ? ((data as any).user_vote || []).some((v: any) => v.user_id === currentUserId) : false
  } as ForumPost;
}

export async function fetchComments(postId: string, currentUserId?: string): Promise<ForumComment[]> {
  const { data, error } = await supabase
    .from('forum_comments')
    .select(`
      *,
      forum_comment_likes(count)${currentUserId ? `, user_like:forum_comment_likes(comment_id, user_id)` : ''}
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
  
  return (data || []).map((comment: any) => ({
    ...comment,
    likes_count: comment.forum_comment_likes?.[0]?.count || 0,
    has_liked: currentUserId ? (comment.user_like || []).some((l: any) => l.user_id === currentUserId) : false
  })) as ForumComment[];
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

export async function fetchUserPosts(userId: string): Promise<ForumPost[]> {
  const { data, error } = await supabase
    .from('forum_posts')
    .select('*, forum_comments(count), forum_post_upvotes(count)')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching user posts:", error);
    return [];
  }
  
  return (data || []).map((post: any) => {
    if (!post) return null;
    return {
      ...post,
      comment_count: post.forum_comments?.[0]?.count || 0,
      upvotes_count: post.forum_post_upvotes?.[0]?.count || 0
    };
  }).filter(Boolean) as ForumPost[];
}

export async function deletePost(postId: string): Promise<{ error: Error | null }> {
  // Note: RLS should handle permissions, but we expect only the author to call this.
  const { error } = await supabase
    .from('forum_posts')
    .delete()
    .eq('id', postId);

  return { error };
}

export async function updatePost(
  id: string,
  title: string,
  body: string,
  channel_id: string,
  tags: string[],
  author_username: string
): Promise<{ data: ForumPost | null; error: Error | null; newId?: string }> {
  // estimate read time (rough estimate: 200 words per minute)
  const wordCount = body.trim().split(/\s+/).length;
  const read_time_minutes = Math.max(1, Math.ceil(wordCount / 200));

  // Determine if ID needs to change based on the new title
  const parts = id.split(':');
  const oldRand = parts.length > 1 ? parts[parts.length - 1].split('-').pop() : Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, '0');
  const newSlug = slugify(title);
  const newId = newSlug ? `${author_username}:${newSlug}-${oldRand}` : `${author_username}:${oldRand}`;

  if (newId !== id) {
    // If ID changed, we perform the update which Cascades to other tables if ON UPDATE CASCADE is set.
    // If it's not set, this might fail unless handled manually.
    const { data, error } = await supabase
      .from('forum_posts')
      .update({
        id: newId,
        title,
        body,
        channel_id,
        tags,
        read_time_minutes,
      })
      .eq('id', id)
      .select('*')
      .single();

    return { data, error, newId: error ? undefined : newId };
  }

  // If ID didn't change, just update the rest
  const { data, error } = await supabase
    .from('forum_posts')
    .update({
      title,
      body,
      channel_id,
      tags,
      read_time_minutes,
    })
    .eq('id', id)
    .select('*')
    .single();

  return { data, error };
}

export async function toggleUpvote(postId: string, userId: string): Promise<{ error: Error | null }> {
  // Check if vote exists
  const { data: existingVote } = await supabase
    .from('forum_post_upvotes')
    .select('id')
    .eq('post_id', postId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingVote) {
    // Remove vote
    const { error } = await supabase
      .from('forum_post_upvotes')
      .delete()
      .eq('id', existingVote.id);
    return { error };
  } else {
    // Add vote
    const { error } = await supabase
      .from('forum_post_upvotes')
      .insert([{ post_id: postId, user_id: userId }]);
    return { error };
  }
}

export async function toggleCommentLike(commentId: string, userId: string): Promise<{ error: Error | null }> {
  // Check if like exists
  const { data: existingLike } = await supabase
    .from('forum_comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (existingLike) {
    // Remove like
    const { error } = await supabase
      .from('forum_comment_likes')
      .delete()
      .eq('id', existingLike.id);
    return { error };
  } else {
    // Add like
    const { error } = await supabase
      .from('forum_comment_likes')
      .insert([{ comment_id: commentId, user_id: userId }]);
    return { error };
  }
}

export async function deleteComment(commentId: string): Promise<{ error: Error | null }> {
  const { error } = await supabase
    .from('forum_comments')
    .delete()
    .eq('id', commentId);

  return { error };
}




// Profanity Logic
leoProfanity.loadDictionary();

export function checkProfanity(text: string): boolean {
  return leoProfanity.check(text);
}
