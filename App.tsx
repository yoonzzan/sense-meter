import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { supabase } from './lib/supabaseClient';
import type { Post, Profile } from './types';

import AuthComponent from './components/Auth';
import Onboarding from './components/Onboarding';
import Header from './components/Header';
import MainFeed from './components/MainFeed';
import CreatePost from './components/CreatePost';
import PostDetail from './components/PostDetail';
import EditProfile from './components/EditProfile';

const App: React.FC = () => {
  const [session, setSession] = useState<any>(null); // Session type is complex, keeping any for now or could import Session from supabase-js
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [showEditProfile, setShowEditProfile] = useState(false);

  const selectedPost = posts.find(p => p.id === selectedPostId) || null;

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      fetchPosts();
    }
  }, [session]);

  // selectedPost is now derived, so we don't need the synchronization useEffect


  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      // PGRST116: 결과가 0개일 때 (프로필 데이터가 없을 때)
      if (error.code === 'PGRST116') {
        console.log("프로필 데이터가 없습니다. 자동 생성을 시도합니다.");

        // 현재 로그인된 사용자 정보 가져오기
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          const newProfile = {
            id: userId,
            display_name: user.user_metadata?.display_name || 'New User',
            avatar_url: user.user_metadata?.avatar_url || null
          };

          // 프로필 생성 시도
          const { data: createdProfile, error: createError } = await supabase
            .from('profiles')
            .insert(newProfile)
            .select()
            .single();

          if (createError) {
            console.error('프로필 자동 생성 실패:', createError.message);
            // 자동 생성도 실패하면 온보딩을 띄워줍니다.
            setShowOnboarding(true);
          } else {
            setProfile(createdProfile);
          }
        }
      } else {
        // 그 외의 진짜 오류
        console.error('Error fetching profile:', error.message);
      }
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        author:profiles!author_id(*),
        comments:comments(
          id,
          created_at,
          text,
          author:profiles!author_id(*)
        ),
        reaction_tags(tag, count)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching posts:', error.message);
      alert(`게시물 불러오기 실패: ${error.message}`);
    } else {
      setPosts(data as Post[]);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setProfile(null);
  };

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    if (session && !profile) {
      // 이 부분은 fetchProfile의 자동 복구 로직이 실패했을 때를 대비한 최후의 수단입니다.
      const newProfile = {
        id: session.user.id,
        display_name: 'New User',
        avatar_url: null
      };
      const { data, error } = await supabase.from('profiles').insert(newProfile).select().single();
      if (!error && data) setProfile(data);
      else if (error) console.error("Onboarding profile creation failed:", error.message);
    }
  };

  const handleCreatePost = async (postData: { type: 'best' | 'worst'; situation: string; sensation: string; emotionTag: string; }) => {
    if (!session) return;

    const { error } = await supabase.from('posts').insert({
      author_id: session.user.id,
      type: postData.type,
      situation: postData.situation,
      sensation: postData.sensation,
      emotion_tag: postData.emotionTag,
      likes: 0,
      agree_count: 0,
      disagree_count: 0,
    });

    if (error) {
      console.error('Error creating post:', error.message);
      alert(`게시물 작성 실패: ${error.message}`);
    } else {
      setShowCreatePost(false);
      fetchPosts();
    }
  };

  const handleLikePost = async (postId: number) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      const newLikes = post.likes + 1;
      setPosts(posts.map(p => p.id === postId ? { ...p, likes: newLikes } : p));
      await supabase.from('posts').update({ likes: newLikes }).eq('id', postId);
    }
  };

  const handlePostReaction = async (postId: number, reaction: 'agree' | 'disagree') => {
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    const column = reaction === 'agree' ? 'agree_count' : 'disagree_count';
    const newValue = post[column] + 1;

    const updatedPosts = posts.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          [column]: newValue
        };
      }
      return p;
    });
    setPosts(updatedPosts);

    const { error } = await supabase.from('posts').update({ [column]: newValue }).eq('id', postId);
    if (error) {
      console.error('Error updating reaction:', error.message);
      // Revert optimistic update if failed
      fetchPosts();
    }
  };

  const handleAddReactionTag = async (postId: number, tag: string) => {
    // insert 대신 RPC 함수 사용
    const { error } = await supabase.rpc('add_reaction_tag', {
      post_id_param: postId,
      tag_param: tag
    });

    if (error) {
      console.error('Error adding reaction tag:', error.message);
      alert(`태그 추가 실패: ${error.message}`);
    } else {
      // 성공 시 데이터 갱신 (간단하게 전체 다시 불러오기)
      // fetchPosts가 완료되면 useEffect에 의해 selectedPost도 업데이트됩니다.
      fetchPosts();
    }
  };

  const handleAddComment = async (postId: number, text: string) => {
    if (!session) return;

    const { data, error } = await supabase.from('comments').insert({
      post_id: postId,
      author_id: session.user.id,
      text: text
    }).select(`*, author:profiles!author_id(*)`).single();

    if (!error && data) {
      const updatedPosts = posts.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [data, ...p.comments],
            comments_count: p.comments_count + 1
          };
        }
        return p;
      });
      setPosts(updatedPosts);
    } else if (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  const handleEditProfileUpdate = () => {
    if (session) fetchProfile(session.user.id);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
  }

  if (!session) {
    return <AuthComponent />;
  }

  if (showOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        profile={profile}
        onSignOut={handleSignOut}
        onEditProfile={() => setShowEditProfile(true)}
      />

      <MainFeed
        posts={posts}
        onPostClick={(post: Post) => setSelectedPostId(post.id)}
        onLikePost={handleLikePost}
      />

      <button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 right-6 bg-[#FF6B00] text-white p-4 rounded-full shadow-lg hover:bg-[#E66000] transition-colors z-10"
        aria-label="글쓰기"
      >
        <Plus size={24} />
      </button>

      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onPost={handleCreatePost}
        />
      )}

      {selectedPost && (
        <PostDetail
          post={selectedPost}
          onClose={() => setSelectedPostId(null)}
          onPostReaction={handlePostReaction}
          onAddReactionTag={handleAddReactionTag}
          onAddComment={handleAddComment}
        />
      )}

      {showEditProfile && profile && (
        <EditProfile
          profile={profile}
          onClose={() => setShowEditProfile(false)}
          onUpdate={handleEditProfileUpdate}
        />
      )}
    </div>
  );
};

export default App;