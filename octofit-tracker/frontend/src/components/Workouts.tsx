import { CapabilityCard } from './CapabilityCard.js';

type Suggestion = { title: string; reason: string };

export default function Workouts() {
  return <CapabilityCard<Suggestion>
    title="Workout suggestions"
    description="Recommend workouts from activity patterns."
    path={`/api/workouts/suggestions/${encodeURIComponent('mona@example.com')}`}
    collection="suggestions"
    emptyText="No workout suggestions yet."
    renderItem={(suggestion) => `${suggestion.title}: ${suggestion.reason}`}
  />;
}
