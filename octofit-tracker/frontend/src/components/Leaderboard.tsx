import { CapabilityCard } from './CapabilityCard.js';

type Standing = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  return <CapabilityCard<Standing>
    title="Leaderboard"
    description="Compare team point totals."
    path="/api/leaderboard"
    collection="leaderboard"
    emptyText="No leaderboard scores yet."
    renderItem={(standing) => `#${standing.rank} ${standing.teamName}: ${standing.totalPoints} points`}
  />;
}
