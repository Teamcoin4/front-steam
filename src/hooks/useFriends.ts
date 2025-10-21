'use client';

import { useState, useEffect } from 'react';
import { getFriendsList } from '@/lib/friendsApi';
import { Friend } from '@/types/friend';

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchFriends = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFriendsList();
      setFriends(data.items);
      setTotal(data.summary.total);
    } catch (err) {
      setError('친구 목록을 불러올 수 없습니다');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  return { friends, loading, error, total, refresh: fetchFriends };
}