
import React, { useState } from 'react';
import type { Post } from '../types';
import { ThumbsUp, ThumbsDown, Send, Plus, Trash2, Thermometer } from 'lucide-react';
import BrainIcon from './icons/BrainIcon';
import LightbulbIcon from './icons/LightbulbIcon';
import { formatTimestamp } from '../utils/formatTimestamp';
import ReactMarkdown from 'react-markdown';
// import { GoogleGenAI, Type } from '@google/genai'; // Removed direct SDK usage

interface PostDetailProps {
  post: Post;
  onClose: () => void;
  onPostReaction: (postId: number, reaction: 'agree' | 'disagree') => void;
  onAddReactionTag: (postId: number, tag: string) => void;
  onAddComment: (postId: number, commentText: string) => void;
  currentUserId?: string;
  onDeletePost: (postId: number) => void;
  onDeleteComment: (postId: number, commentId: number) => void;
}

interface AIAnalysis {
  agree: string;
  disagree: string;
  gapAnalysis?: string;
}

const PostDetail: React.FC<PostDetailProps> = ({ post, onClose, onPostReaction, onAddReactionTag, onAddComment, currentUserId, onDeletePost, onDeleteComment }) => {
  const [commentText, setCommentText] = useState('');
  const [reactionTag, setReactionTag] = useState('');
  const [voted, setVoted] = useState<'agree' | 'disagree' | null>(null);
  const [votedTags, setVotedTags] = useState<Set<string>>(new Set());
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const isBest = post.type === 'best';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(post.id, commentText);
      setCommentText('');
    }
  };

  const handleReactionTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reactionTag.trim()) {
      const tagToAdd = reactionTag.startsWith('#') ? reactionTag : `#${reactionTag}`;
      onAddReactionTag(post.id, tagToAdd);
      setReactionTag('');
    }
  };

  const handleReactionTagClick = (tag: string) => {
    if (!votedTags.has(tag)) {
      onAddReactionTag(post.id, tag);
      setVotedTags(prev => new Set(prev).add(tag));
    }
  };

  const handleVote = (reaction: 'agree' | 'disagree') => {
    if (!voted) {
      onPostReaction(post.id, reaction);
      setVoted(reaction);
    }
  };

  const handleGetAIAnalysis = async () => {
    setIsLoadingAI(true);
    setAiError(null);
    setAiAnalysis(null);

    try {
      const response = await fetch('/api/analyze-sense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ post }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'AI 분석 요청 실패');
      }

      const analysisJson = await response.json();
      setAiAnalysis(analysisJson);

    } catch (error) {
      console.error("AI analysis failed:", error);
      setAiError(error instanceof Error ? error.message : "AI 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoadingAI(false);
    }
  };


  const totalVotes = post.agree_count + post.disagree_count;
  const agreePercentage = totalVotes > 0 ? (post.agree_count / totalVotes) * 100 : 0;

  const sortedReactionTags = [...post.reaction_tags].sort((a, b) => b.count - a.count);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="fixed inset-0 h-[100dvh] bg-gray-50 z-20 flex justify-center overscroll-none touch-pan-y overflow-x-hidden">
      <div className="w-full max-w-md bg-white flex flex-col h-full shadow-xl relative">
        <header className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
          <button onClick={onClose} aria-label="뒤로가기">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <h1 className="font-bold text-lg text-gray-800"></h1>
          <div className="flex items-center gap-2">
            {currentUserId === post.author.id && (
              <button onClick={() => onDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition-colors" aria-label="삭제">
                <Trash2 size={20} />
              </button>
            )}
            <div className="w-6 h-6"></div>
          </div>
        </header>

        <main className="flex-grow overflow-y-auto pb-24 bg-gray-50">
          {/* Post Content */}
          <div className="bg-white p-5 border-b border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
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

            <div className="space-y-4 text-sm mb-4">
              <div className={`border-l-4 p-4 rounded-r-md ${isBest ? 'bg-rose-50 border-rose-400' : 'bg-blue-50 border-blue-400'}`}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-bold text-base ${isBest ? 'text-rose-800' : 'text-blue-800'}`}>{isBest ? '오늘의 최고 👍' : '오늘의 최악 👎'}</span>
                </div>
                <p className="text-gray-800 leading-relaxed text-[15px] mb-4">{post.situation}</p>
                <div className="border-t border-dashed pt-4">
                  <p className="text-xs text-gray-500 font-bold mb-2">💬 나의 감정</p>
                  <p className="text-gray-700 leading-relaxed text-[14px] italic">{post.sensation}</p>
                </div>
              </div>
            </div>
            <div>
              <span className="inline-block bg-orange-100 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full">
                {post.emotion_tag}
              </span>
            </div>
          </div>

          {/* Sense Meter */}
          <div className="bg-white p-5 mt-2 border-y border-gray-100">
            <div className="flex items-center gap-2 mb-1">
              <Thermometer className="w-5 h-5 text-[#FF6B00]" />
              <h2 className="font-bold text-base text-gray-800">공감 온도계</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4 ml-1">이 경험에 대해 다른 사람들은 어떻게 느낄까요?</p>

            <div className="relative w-full flex items-center mb-6 px-1">
              {/* Bulb */}
              <div className={`w-10 h-10 rounded-full flex-shrink-0 z-10 -mr-3 border-4 border-white shadow-sm flex items-center justify-center transition-colors duration-500 ${agreePercentage > 0 ? 'bg-[#FF6B00]' : 'bg-gray-300'}`}>
                <span className="text-xs font-bold text-white">{Math.round(agreePercentage)}°</span>
              </div>
              {/* Stem */}
              <div className="flex-grow h-4 bg-gray-100 rounded-r-full overflow-hidden relative shadow-inner">
                {/* Mercury */}
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-[#FF6B00] transition-all duration-1000 ease-out rounded-r-full"
                  style={{ width: `${agreePercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs text-gray-500 font-medium mb-4 px-2">
              <span className="text-[#FF6B00] font-bold">🔥 공감해요 ({post.agree_count})</span>
              <span className="text-gray-400">❄️ 달라요 ({post.disagree_count})</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote('agree')}
                disabled={!!voted}
                className={`py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors disabled:cursor-not-allowed ${voted === 'agree'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400'
                  }`}
              >
                <ThumbsUp size={16} /> 정말 공감!
              </button>
              <button
                onClick={() => handleVote('disagree')}
                disabled={!!voted}
                className={`py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-colors disabled:cursor-not-allowed ${voted === 'disagree'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400'
                  }`}
              >
                <ThumbsDown size={16} /> 내 느낌은 좀 달라
              </button>
            </div>
          </div>

          {/* Reaction Tags */}
          <div className="bg-white p-5 mt-2 border-y border-gray-100">
            <h2 className="font-bold text-base text-gray-800 mb-3">반응 태그</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {sortedReactionTags.map(({ tag, count }) => {
                const hasVoted = votedTags.has(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => handleReactionTagClick(tag)}
                    disabled={hasVoted}
                    className={`text-sm font-medium px-3 py-1.5 rounded-full flex items-center transition-colors duration-200 ease-in-out ${hasVoted
                      ? 'bg-orange-100 text-orange-700 cursor-default'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {tag}
                    <span className={`ml-1.5 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${hasVoted ? 'bg-orange-400' : 'bg-orange-500'
                      }`}>{count}</span>
                  </button>
                )
              })}
              {sortedReactionTags.length === 0 && <p className="text-sm text-gray-400">아직 반응 태그가 없어요.</p>}
            </div>
            <form onSubmit={handleReactionTagSubmit} className="flex gap-2">
              <input
                type="text"
                value={reactionTag}
                onChange={(e) => setReactionTag(e.target.value)}
                className="flex-grow p-3 bg-gray-100 border border-transparent rounded-lg text-sm text-gray-800 focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent placeholder-gray-400"
                placeholder="#태그 추가"
              />
              <button type="submit" className="bg-[#FF6B00] text-white p-3 rounded-lg hover:bg-[#E66000] disabled:bg-gray-300" disabled={!reactionTag.trim()}>
                <Plus size={20} />
              </button>
            </form>
          </div>

          {/* AI Analysis */}
          <div className="bg-white p-5 mt-2 border-y border-gray-100">
            <div className="flex items-center gap-2 mb-3">
              <BrainIcon className="w-6 h-6 text-gray-500" />
              <h2 className="font-bold text-base text-gray-800">AI와 함께 감각 발휘하기</h2>
            </div>


            {aiAnalysis && !isLoadingAI && (
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-bold text-green-800 mb-2 flex items-center gap-2 text-sm">
                    <ThumbsUp className="w-4 h-4" />
                    공감하는 시선 🧐
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown>{aiAnalysis.agree}</ReactMarkdown>
                  </div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                    <ThumbsDown className="w-4 h-4" />
                    다른 시선 👀
                  </h3>
                  <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                    <ReactMarkdown>{aiAnalysis.disagree}</ReactMarkdown>
                  </div>
                </div>
                {aiAnalysis.gapAnalysis && (
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h3 className="font-bold text-purple-800 mb-2 flex items-center gap-2 text-sm">
                      <LightbulbIcon className="w-4 h-4" />
                      종합 인사이트 및 트렌드 📊
                    </h3>
                    <div className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0">
                      <ReactMarkdown>{aiAnalysis.gapAnalysis}</ReactMarkdown>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isLoadingAI && (
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="text-4xl animate-bounce">🌊</div>
                <div className="text-sm text-gray-500 font-medium animate-pulse">
                  AI가 숨겨진 트렌드 파도를 분석하고 있어요...
                </div>
              </div>
            )}
            {aiError && (
              <div className="text-sm text-red-600 text-center py-4">{aiError}</div>
            )}
            {!aiAnalysis && !isLoadingAI && (
              <button onClick={handleGetAIAnalysis} className="w-full bg-gray-800 text-white font-bold py-3 rounded-lg hover:bg-gray-700 transition-colors">
                이 물결은 파도가 될까?
              </button>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white p-5 mt-2 border-b border-gray-100">
            <h2 className="font-bold text-base text-gray-800 mb-4">댓글 ({post.comments_count})</h2>
            <div className="space-y-4">
              {post.comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <img
                    src={comment.author.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.author.id}`}
                    alt={comment.author.display_name || 'User'}
                    className="w-8 h-8 rounded-full mt-1 bg-gray-100"
                  />
                  <div className="flex-1">
                    <div className="bg-gray-100 p-3 rounded-lg relative group">
                      <p className="font-bold text-sm text-gray-900">{comment.author.display_name || '익명'}</p>
                      <p className="text-sm text-gray-800 mt-1">{comment.text}</p>
                      {currentUserId === comment.author.id && (
                        <button
                          onClick={() => onDeleteComment(post.id, comment.id)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="댓글 삭제"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1.5 ml-1">{formatTimestamp(comment.created_at)}</p>
                  </div>
                </div>
              ))}
              {post.comments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">첫 댓글을 남겨보세요!</p>}
            </div>
          </div>

        </main>

        {/* Comment Input */}
        <footer className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-[env(safe-area-inset-bottom)]">
          <form onSubmit={handleCommentSubmit} className="max-w-xl mx-auto flex items-center p-3 gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-grow w-full bg-gray-100 border border-transparent rounded-full py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] text-base text-gray-800 placeholder-gray-500"
              placeholder="댓글을 입력하세요..."
              style={{ fontSize: '16px' }} // Explicitly enforce 16px to prevent iOS zoom
            />
            <button type="submit" disabled={!commentText.trim()} className="p-2.5 rounded-full bg-[#FF6B00] text-white disabled:bg-gray-300 transition-colors">
              <Send size={18} />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
};

export default PostDetail;
