import React from 'react';
import type { Post } from '../types';
import PostCard from './PostCard';

interface MainFeedProps {
  posts: Post[];
  onPostClick: (post: Post) => void;
  onLikePost: (postId: number) => void;
}

const MainFeed: React.FC<MainFeedProps> = ({ posts, onPostClick, onLikePost }) => {
  return (
    <main className="pt-4 pb-20">
      <div className="max-w-xl mx-auto px-4 space-y-4">
        {posts.map((post) => (
          <div key={post.id} onClick={() => onPostClick(post)} className="cursor-pointer">
            <PostCard post={post} onLikePost={onLikePost} />
          </div>
        ))}
      </div>
    </main>
  );
};

export default MainFeed;