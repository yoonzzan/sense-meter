import React, { useState } from 'react';
import { X, ThumbsUp, ThumbsDown } from 'lucide-react';

interface CreatePostProps {
  onClose: () => void;
  onPost: (post: { type: 'best' | 'worst'; situation: string; sensation: string; emotionTag: string; }) => void;
}

const popularTags = ['#뿌듯함', '#황당함', '#JMT', '#소확행', '#개이득'];

const CreatePost: React.FC<CreatePostProps> = ({ onClose, onPost }) => {
  const [type, setType] = useState<'best' | 'worst'>('best');
  const [situation, setSituation] = useState('');
  const [sensation, setSensation] = useState('');
  const [emotionTag, setEmotionTag] = useState('');
  const [isComposing, setIsComposing] = useState(false);

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
      onPost({ type, situation, sensation, emotionTag: formatTag(emotionTag) });
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
    <div className="fixed inset-0 bg-gray-50 z-20 flex flex-col">
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
            className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border-2 transition-all ${
              type === 'best' ? 'border-[#FF6B00] bg-orange-50' : 'border-gray-300 bg-white'
            }`}
          >
            <ThumbsUp className={`w-6 h-6 ${type === 'best' ? 'text-orange-500' : 'text-gray-400'}`} />
            <span className={`font-bold ${type === 'best' ? 'text-orange-600' : 'text-gray-600'}`}>최고예요</span>
          </button>
          <button
            onClick={() => setType('worst')}
            className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-lg border-2 transition-all ${
              type === 'worst' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'
            }`}
          >
            <ThumbsDown className={`w-6 h-6 ${type === 'worst' ? 'text-blue-500' : 'text-gray-400'}`} />
            <span className={`font-bold ${type === 'worst' ? 'text-blue-600' : 'text-gray-600'}`}>최악이에요</span>
          </button>
        </div>

        <div>
           <h2 className="font-bold mb-2">경험 내용</h2>
          <textarea
            value={situation}
            onChange={(e) => setSituation(e.target.value)}
            rows={5}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none"
            placeholder="어떤 상황이었나요?&#10;있었던 일을 객관적으로 알려주세요."
          />
        </div>

        <div>
           <h2 className="font-bold mb-2">나의 감각</h2>
          <textarea
            value={sensation}
            onChange={(e) => setSensation(e.target.value)}
            rows={5}
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none"
            placeholder="그 상황에서 어떤 감정을 느끼셨나요?&#10;당신의 감각을 들려주세요."
          />
        </div>

        <div>
          <h2 className="font-bold mb-2">감정 태그</h2>
          <input
            type="text"
            value={emotionTag}
            onChange={handleEmotionTagChange}
            onCompositionStart={handleCompositionStart}
            onCompositionEnd={handleCompositionEnd}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
            placeholder="#하나만_입력해_주세요"
          />
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
  );
};

export default CreatePost;