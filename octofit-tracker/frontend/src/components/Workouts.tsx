import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };

export default function Workouts() {
  const loadSuggestions = useCallback(
    () => getJson<{ suggestions: Suggestion[] }>(`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`)
      .then(({ suggestions }) => suggestions),
    [],
  );

  return <CapabilityCard<Suggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    loadItems={loadSuggestions}
    emptyText="No workout suggestions yet."
    renderItem={(suggestion) => `${suggestion.title}: ${suggestion.reason}`}
  />;
}
