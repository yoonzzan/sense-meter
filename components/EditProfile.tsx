
import React, { useState } from 'react';
import { X, RefreshCw, Save } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Profile } from '../types';

interface EditProfileProps {
  profile: Profile;
  onClose: () => void;
  onUpdate: () => void;
}

const EditProfile: React.FC<EditProfileProps> = ({ profile, onClose, onUpdate }) => {
  const [displayName, setDisplayName] = useState(profile.display_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`);
  const [isLoading, setIsLoading] = useState(false);

  const handleRandomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  const handleSave = async () => {
    if (!displayName.trim()) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName,
          avatar_url: avatarUrl
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      onUpdate(); // Refresh profile in App
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('프로필 수정 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-sm overflow-hidden shadow-xl">
        <header className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-bold text-lg text-gray-900">프로필 수정</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </header>

        <div className="p-6 flex flex-col items-center space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3">
            <div className="relative group">
                <img 
                    src={avatarUrl} 
                    alt="Profile Preview" 
                    className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-sm bg-gray-50"
                />
                <button 
                    onClick={handleRandomizeAvatar}
                    className="absolute bottom-0 right-0 bg-white border border-gray-200 p-2 rounded-full shadow-md hover:bg-gray-50 text-gray-600"
                    title="이미지 랜덤 변경"
                >
                    <RefreshCw size={16} />
                </button>
            </div>
            <p className="text-xs text-gray-500">아이콘을 눌러 이미지를 바꿔보세요</p>
          </div>

          {/* Name Input Section */}
          <div className="w-full">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              닉네임
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent outline-none"
              placeholder="닉네임을 입력하세요"
              maxLength={10}
            />
            <p className="text-xs text-gray-400 mt-1 text-right">{displayName.length}/10</p>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading || !displayName.trim()}
            className="w-full bg-[#FF6B00] text-white font-bold py-3 rounded-lg hover:bg-[#E66000] transition-colors flex items-center justify-center gap-2 disabled:bg-gray-300"
          >
            {isLoading ? '저장 중...' : (
                <>
                    <Save size={18} /> 저장하기
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;
