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
  if (error) {
    console.error("Error fetching channels:", error);
    return [];
  }
  return data || [];
}

export async function fetchPosts(): Promise<ForumPost[]> {
  const { data, error } = await supabase.from('forum_posts').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
  return data || [];
}

// Add further stubs like createPost, createComment, votePost down the road.
