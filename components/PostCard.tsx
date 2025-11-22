
import React, { useState } from 'react';
import type { Post } from '../types';
import { ThumbsUp, ThumbsDown, MessageCircle, Share2, Heart } from 'lucide-react';
import { formatTimestamp } from '../utils/formatTimestamp';

interface PostCardProps {
  post: Post;
  onLikePost: (postId: number) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onLikePost }) => {
  const [isSharing, setIsSharing] = useState(false);
  const isBest = post.type === 'best';

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLikePost(post.id);
  };

  const handleShareClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSharing) return;

    const shareData = {
      title: `SENSE METER: ${post.author.display_name}님의 감각`,
      text: `"${post.situation}" - 이 경험, 어떻게 생각하세요?`,
      url: window.location.origin,
    };

    if (!navigator.share) {
      alert('이 브라우저에서는 공유 기능을 지원하지 않습니다.');
      return;
    }

    try {
      setIsSharing(true);
      await navigator.share(shareData);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.log('Share canceled by user.');
      } else {
        console.error('Share failed:', err);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 space-y-4 transition-shadow hover:shadow-md">
      <div className="flex items-center space-x-3">
        <img
          src={post.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author.id}`}
          alt={post.author.display_name || 'User'}
          className="w-10 h-10 rounded-full bg-gray-100"
        />
        <div>
          <p className="font-bold text-sm text-gray-900">{post.author.display_name || '익명'}</p>
          <p className="text-xs text-gray-500">{formatTimestamp(post.created_at)}</p>
        </div>
      </div>

      <div className="space-y-4 text-sm">
        {isBest ? (
          <div className="bg-rose-50 border-l-4 border-rose-300 p-3 rounded-r-md">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsUp className="w-4 h-4 text-rose-500" />
              <h3 className="font-bold text-rose-600">오늘의 최고 👍</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">{post.situation}</p>
            <blockquote className="border-l-2 border-rose-200 pl-3 text-gray-600 italic text-xs">
              {post.sensation}
            </blockquote>
          </div>
        ) : (
          <div className="bg-blue-50 border-l-4 border-blue-300 p-3 rounded-r-md">
            <div className="flex items-center gap-2 mb-2">
              <ThumbsDown className="w-4 h-4 text-blue-500" />
              <h3 className="font-bold text-blue-600">오늘의 최악 👎</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-3">{post.situation}</p>
            <blockquote className="border-l-2 border-blue-200 pl-3 text-gray-600 italic text-xs">
              {post.sensation}
            </blockquote>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <div>
          <span className="inline-block bg-[#FF6B00] bg-opacity-10 text-[#FF6B00] text-xs font-semibold px-2.5 py-1 rounded-full">
            {post.emotion_tag}
          </span>
        </div>
        <div className="flex items-center space-x-4 text-gray-500">
          <button onClick={handleLikeClick} className="flex items-center space-x-1 transition-transform transform hover:scale-110">
            <Heart size={16} />
            <span className="text-xs font-medium">{post.likes}</span>
          </button>
          <div className="flex items-center space-x-1">
            <MessageCircle size={16} />
            <span className="text-xs font-medium">{post.comments_count}</span>
          </div>
          <button
            onClick={handleShareClick}
            disabled={isSharing}
            className="transition-transform transform hover:scale-110 disabled:opacity-50 disabled:cursor-wait"
            aria-label="포스트 공유"
          >
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
