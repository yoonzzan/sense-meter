import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown, Sparkles } from 'lucide-react';

interface CreatePostProps {
  onClose: () => void;
  onPost: (post: { type: 'best' | 'worst'; category: string; situation: string; sensation: string; emotionTag: string; }) => void;
}

const popularTags = ['#오히려좋아', '#갓생', '#킹받네', '#가보자고', '#럭키비키'];

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPost }) => {
  const [type, setType] = useState<'best' | 'worst'>('best');
  const [category, setCategory] = useState('daily');
  const [situation, setSituation] = useState('');
  const [sensation, setSensation] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [activeField, setActiveField] = useState<'situation' | 'sensation' | 'tag' | null>(null);
  const [recommendedTags, setRecommendedTags] = useState<string[]>([]);
  const [isRecommending, setIsRecommending] = useState(false);

  const categories = [
    { id: 'daily', label: '일상', icon: '🏠' },
    { id: 'work', label: '직장', icon: '💼' },
    { id: 'relationship', label: '관계', icon: '👥' },
    { id: 'consumption', label: '소비', icon: '🛒' },
    { id: 'service', label: '서비스', icon: '🛎️' },
    { id: 'content', label: '콘텐츠', icon: '🎬' },
    { id: 'hobby', label: '취미', icon: '🎨' },
    { id: 'etc', label: '기타', icon: '✨' },
  ];

  const guides = {
    situation: {
      title: '💡 상황 작성 팁',
      text: '감정을 섞지 않고, 있었던 일(Fact)만 객관적으로 적어주시면 좋아요.',
      example: '예시: 오늘 아침 출근길 지하철에서...'
    },
    sensation: {
      title: '💡 감정 작성 팁',
      text: '그 순간 느꼈던 솔직한 감정을 적어주세요. 내 감정과 대중의 반응을 비교해보는 것이 바로 감각을 익히는 과정이에요.',
      example: '예시: 너무 억울하고 답답해서 소리라도 지르고 싶었어요.'
    },
    tag: {
      title: '💡 태그 작성 팁',
      text: '이 경험을 한마디로 표현하는 핵심 키워드를 적어주세요.',
      example: '예시: #지옥철 #출근길'
    }
  };

  const formatTag = (tag: string): string => {
    if (!tag) return '';
    // Use Unicode property escapes to match letters and numbers from any language
    const cleanedTag = tag.replace(/[^\p{L}\p{N}]/gu, '');
    if (!cleanedTag) return '';
    return `#${cleanedTag}`;
  };

  const handleFormatAndSetTag = (value: string) => {
    const formatted = formatTag(value);
    setEmotionTag(formatted);
  };

  const canPost =
    situation.trim().length > 0 &&
    sensation.trim().length > 0 &&
    emotionTag.replace(/[^\p{L}\p{N}]/gu, '').length > 0;

  const handlePost = () => {
    if (canPost) {
      // Ensure the tag is formatted before posting, in case blur/enter didn't fire
      onPost({ type, category, situation, sensation, emotionTag: formatTag(emotionTag) });
    }
  };

  const handleRecommendTags = async () => {
    if (!situation || !sensation) {
      alert('상황과 감정을 먼저 작성해주세요!');
      return;
    }

    setIsRecommending(true);
    try {
      const response = await fetch('/api/recommend-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, sensation }),
      });
      const data = await response.json();
      if (data.tags) {
        setRecommendedTags(data.tags);
      }
    } catch (error) {
      console.error('Error recommending tags:', error);
      alert('태그 추천 중 오류가 발생했습니다.');
    } finally {
      setIsRecommending(false);
    }
  };

  const handleTagClick = (tag: string) => {
    setEmotionTag(tag);
  };

  const handleEmotionTagChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // We always update the state to show what the user is typing.
    // The isComposing flag is used to prevent premature formatting, not to block input.
    setEmotionTag(e.target.value);
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    setIsComposing(false);
    // After composition ends, ensure React's state is synced with the input's final value.
    setEmotionTag(e.currentTarget.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Format the tag when Enter is pressed, but only if composition is not active.
    if (e.key === 'Enter' && !isComposing) {
      e.preventDefault();
      handleFormatAndSetTag(e.currentTarget.value);
      e.currentTarget.blur();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Format the tag when the input loses focus, but only if composition is not active.
    if (!isComposing) {
      handleFormatAndSetTag(e.currentTarget.value);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-50 z-20 flex justify-center">
      <div className="w-full max-w-md bg-white flex flex-col h-full shadow-xl relative">
        <header className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <button onClick={onClose} aria-label="닫기">
            <X className="w-6 h-6 text-gray-500" />
          </button>
          <h1 className="font-bold text-lg">경험 기록하기</h1>
          <button
            onClick={handlePost}
            disabled={!canPost}
            className="font-bold text-lg text-[#FF6B00] disabled:text-gray-300 transition-colors"
          >
            게시
          </button>
        </header>

        <main className="flex-grow p-6 space-y-6 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setType('best')}
              className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border-2 transition-all ${type === 'best' ? 'border-rose-500 bg-rose-50' : 'border-gray-300 bg-white'
                }`}
            >
              <ThumbsUp className={`w-6 h-6 ${type === 'best' ? 'text-rose-500' : 'text-gray-400'}`} />
              <span className={`font-bold ${type === 'best' ? 'text-rose-600' : 'text-gray-600'}`}>최고예요</span>
            </button>
            <button
              onClick={() => setType('worst')}
              className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border-2 transition-all ${type === 'worst' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
                }`}
            >
              <ThumbsDown className={`w-6 h-6 ${type === 'worst' ? 'text-blue-500' : 'text-gray-400'}`} />
              <span className={`font-bold ${type === 'worst' ? 'text-blue-600' : 'text-gray-600'}`}>최악이에요</span>
            </button>
          </div>

          <div>
            <h2 className="font-bold mb-2">카테고리</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${category === cat.id
                    ? 'border-[#FF6B00] bg-orange-50 text-[#FF6B00] font-bold'
                    : 'border-gray-300 bg-white text-gray-600'
                    }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Guide Box */}
          <div className={`transition-all duration-300 overflow-hidden ${activeField ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
            {activeField && (
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
                <h3 className="text-blue-800 font-bold text-sm mb-1">{guides[activeField].title}</h3>
                <p className="text-blue-600 text-xs mb-1">{guides[activeField].text}</p>
                <p className="text-blue-500 text-xs italic">{guides[activeField].example}</p>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-bold mb-2">상황 (무슨 일이 있었나요?)</h2>
            <textarea
              value={situation}
              onChange={(e) => setSituation(e.target.value)}
              onFocus={() => setActiveField('situation')}
              onBlur={() => setActiveField(null)}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none text-sm"
              placeholder="어떤 상황이었나요?&#10;있었던 일을 객관적으로 알려주세요."
            />
          </div>

          <div>
            <h2 className="font-bold mb-2">나의 감정</h2>
            <textarea
              value={sensation}
              onChange={(e) => setSensation(e.target.value)}
              onFocus={() => setActiveField('sensation')}
              onBlur={() => setActiveField(null)}
              rows={4}
              className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none text-sm"
              placeholder="그 상황에서 어떤 감정을 느끼셨나요?&#10;솔직한 마음을 기록해주세요."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-bold">감정 태그</h2>
              <button
                onClick={handleRecommendTags}
                disabled={isRecommending || !situation || !sensation}
                className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full transition-colors ${isRecommending || !situation || !sensation
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
              >
                <Sparkles size={14} />
                <span>{isRecommending ? '분석 중...' : 'AI 추천'}</span>
              </button>
            </div>
            <input
              type="text"
              value={emotionTag}
              onChange={handleEmotionTagChange}
              onCompositionStart={handleCompositionStart}
              onCompositionEnd={handleCompositionEnd}
              onBlur={(e) => {
                handleBlur(e);
                setActiveField(null);
              }}
              onFocus={() => setActiveField('tag')}
              onKeyDown={handleKeyDown}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              placeholder="#하나만_입력해_주세요"
            />

            {/* Recommended Tags Area */}
            {recommendedTags.length > 0 && (
              <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-100">
                <p className="text-xs text-indigo-800 font-bold mb-2 flex items-center">
                  <Sparkles size={12} className="mr-1" /> AI가 추천하는 태그
                </p>
                <div className="flex flex-wrap gap-2">
                  {recommendedTags.map((tag, index) => (
                    <button
                      key={index}
                      onClick={() => handleTagClick(tag)}
                      className="bg-white text-indigo-600 border border-indigo-200 text-sm font-medium px-3 py-1 rounded-full hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {popularTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full hover:bg-gray-200"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreatePost;