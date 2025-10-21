'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Users, Gamepad2, Clock, RefreshCw, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useFriends } from '@/hooks/useFriends';
import { Friend } from '@/types/friend';
import Image from 'next/image';

function FriendItem({ friend }: { friend: Friend }) {
  const getStatusColor = () => {
    if (!friend.stats) return 'bg-gray-500';
    const lastOnline = new Date(friend.stats.last_online_at);
    const hoursSinceOnline = (Date.now() - lastOnline.getTime()) / (1000 * 60 * 60);
    if (hoursSinceOnline < 1) return 'bg-green-500';
    if (hoursSinceOnline < 24) return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  return (
    <div className="group flex items-center gap-3 px-3 py-2 hover:bg-gray-700/50 transition-colors cursor-pointer">
      <div className="relative flex-shrink-0">
        <Image // 💡 <Image> 컴포넌트 사용
        src={friend.avatar}
        alt={friend.persona_name}
        width={40}  // w-10 (40px)
        height={40} // h-10 (40px)
        className="rounded-full border-2 border-gray-600" // 크기 관련 클래스 제거
    />
        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${getStatusColor()} border-2 border-gray-800`} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-medium text-white truncate block">
          {friend.persona_name}
        </span>
        {friend.stats && (
          <div className="flex items-center gap-3 text-xs text-gray-400 mt-0.5">
            <span className="flex items-center gap-1">
              <Gamepad2 className="w-3 h-3" />
              공통 {friend.stats.mutual_owned}
            </span>
            {friend.stats.recent_overlap > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                최근 {friend.stats.recent_overlap}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function LoginRequired() {
  const { login } = useAuth();
  
  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-screen">
      <div className="flex items-center px-4 py-3 bg-gray-900 border-b border-gray-700">
        <Users className="w-5 h-5 text-gray-500 mr-2" />
        <span className="font-semibold text-gray-400">내 친구</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <LogIn className="w-16 h-16 text-gray-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">로그인이 필요합니다</h3>
        <p className="text-sm text-gray-400 mb-6">
          Steam 계정으로 로그인하면<br />친구 목록을 확인할 수 있습니다
        </p>
        <button 
          onClick={login}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
        >
          테스트 로그인
        </button>
      </div>
    </div>
  );
}

export default function FriendsList() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { friends, loading, error, total, refresh } = useFriends();
  const [isExpanded, setIsExpanded] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  if (authLoading) {
    return (
      <div className="w-80 bg-gray-800 border-l border-gray-700 flex items-center justify-center h-screen">
        <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginRequired />;
  }

  const filteredFriends = friends.filter(f =>
    f.persona_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-gray-800 border-l border-gray-700 flex flex-col h-screen">
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-700 cursor-pointer hover:bg-gray-850"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-400" />
          <span className="font-semibold text-white">내 친구 ({total})</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); refresh(); }}
            disabled={loading}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="px-3 py-2 border-b border-gray-700">
            <input
              type="text"
              placeholder="친구 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white text-sm rounded-md border border-gray-600 focus:outline-none focus:border-blue-500 placeholder-gray-400"
            />
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading && friends.length === 0 ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center h-32 text-red-400 text-sm px-4 text-center">
                <p>{error}</p>
                <button onClick={refresh} className="mt-2 text-blue-400 hover:underline">
                  다시 시도
                </button>
              </div>
            ) : filteredFriends.length > 0 ? (
              filteredFriends.map(friend => <FriendItem key={friend.steamid} friend={friend} />)
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 text-sm">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p>검색 결과가 없습니다</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}