import { supabase } from '@/lib/supabase';
import { FeedPost } from '@/types';

function mapPost(row: Record<string, unknown>): FeedPost {
  if (typeof row.id !== 'string') throw new Error('Ugyldig innlegg: mangler id');
  return {
    id: row.id,
    userId: typeof row.user_id === 'string' ? row.user_id : '',
    content: typeof row.content === 'string' ? row.content : '',
    imageUrl: typeof row.image_url === 'string' ? row.image_url : null,
    likes: typeof row.likes === 'number' ? row.likes : 0,
    createdAt: typeof row.created_at === 'string' ? row.created_at : '',
    authorName: typeof row.author_name === 'string' ? row.author_name : null,
    likedByMe: typeof row.liked_by_me === 'boolean' ? row.liked_by_me : false,
  };
}

export async function fetchFeedPosts(limit = 20): Promise<FeedPost[]> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('feed_posts')
    .select('*, profiles(display_name)')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  // Fetch likes for current user in one go
  let myLikedIds = new Set<string>();
  if (user) {
    const { data: likeData } = await supabase
      .from('feed_likes')
      .select('post_id')
      .eq('user_id', user.id);
    if (likeData) myLikedIds = new Set((likeData as { post_id: string }[]).map((l) => l.post_id));
  }

  return (data as Record<string, unknown>[]).map((row) => ({
    ...mapPost(row),
    authorName: typeof (row.profiles as Record<string, unknown> | null)?.display_name === 'string'
      ? (row.profiles as Record<string, unknown>).display_name as string
      : null,
    likedByMe: myLikedIds.has(row.id as string),
  }));
}

export async function createPost(content: string, imageUrl?: string): Promise<FeedPost> {
  const { data, error } = await supabase
    .from('feed_posts')
    .insert({ content, image_url: imageUrl ?? null })
    .select()
    .single();
  if (error) throw new Error(error.message);
  return mapPost(data as Record<string, unknown>);
}

export async function toggleLike(postId: string, likedByMe: boolean): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Ikke innlogget');

  if (likedByMe) {
    await supabase.from('feed_likes').delete().eq('post_id', postId).eq('user_id', user.id);
    const { count } = await supabase.from('feed_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
    await supabase.from('feed_posts').update({ likes: count ?? 0 }).eq('id', postId);
  } else {
    await supabase.from('feed_likes').insert({ post_id: postId, user_id: user.id });
    const { count } = await supabase.from('feed_likes').select('*', { count: 'exact', head: true }).eq('post_id', postId);
    await supabase.from('feed_posts').update({ likes: count ?? 0 }).eq('id', postId);
  }
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from('feed_posts').delete().eq('id', id);
  if (error) throw new Error(error.message);
}
