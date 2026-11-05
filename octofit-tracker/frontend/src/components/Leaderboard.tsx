import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Standing = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const loadLeaderboard = useCallback(
    () => getJson<{ leaderboard: Standing[] }>('/api/leaderboard').then(({ leaderboard }) => leaderboard),
    [],
  );

  return <CapabilityCard<Standing>
    title="Leaderboard"
    description="Compare team point totals."
    loadItems={loadLeaderboard}
    emptyText="No leaderboard scores yet."
    renderItem={(standing) => `#${standing.rank} ${standing.teamName}: ${standing.totalPoints} points`}
  />;
}
