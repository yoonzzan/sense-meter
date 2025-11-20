
import React, { useState, useRef, useEffect } from 'react';
import SenseMeterIcon from './icons/SenseMeterIcon';
import { Profile } from '../types';
import { LogOut, User, Settings } from 'lucide-react';

interface HeaderProps {
    profile: Profile | null;
    onSignOut: () => void;
    onEditProfile: () => void;
}

const Header: React.FC<HeaderProps> = ({ profile, onSignOut, onEditProfile }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-10">
      <div className="max-w-xl mx-auto h-16 flex items-center justify-between px-4">
        <div className="w-1/3"></div>
        <div className="w-1/3 flex justify-center">
            <SenseMeterIcon className="h-6" />
        </div>
        <div className="w-1/3 flex justify-end">
            {profile && (
                <div className="relative" ref={menuRef}>
                    <button onClick={() => setMenuOpen(!menuOpen)}>
                        <img 
                            src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`}
                            alt={profile.display_name || 'User'}
                            className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-gray-200 bg-gray-100"
                        />
                    </button>
                    {menuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                            <div className="px-4 py-3 border-b bg-gray-50">
                                <p className="text-sm font-bold text-gray-900 truncate">{profile.display_name || '닉네임 없음'}</p>
                                <p className="text-xs text-gray-500 truncate mt-0.5">프로필을 설정해보세요</p>
                            </div>
                            
                            <button
                                onClick={() => {
                                    onEditProfile();
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Settings size={16} />
                                프로필 수정
                            </button>

                            <button
                                onClick={() => {
                                    onSignOut();
                                    setMenuOpen(false);
                                }}
                                className="w-full text-left flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 border-t border-gray-100"
                            >
                                <LogOut size={16} />
                                로그아웃
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </header>
  );
};

export default Header;
