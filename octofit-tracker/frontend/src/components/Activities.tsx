import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const loadActivities = useCallback(
    () => getJson<{ activities: Activity[] }>('/api/activities').then(({ activities }) => activities),
    [],
  );

  return <CapabilityCard<Activity>
    title="Activities"
    description="Track student activity minutes and points."
    loadItems={loadActivities}
    emptyText="No activities yet."
    renderItem={(activity) => `${activity.type}: ${activity.minutes} minutes, ${activity.points} points`}
  />;
}
