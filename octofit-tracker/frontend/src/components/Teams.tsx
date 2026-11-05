import { useCallback } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: unknown[] };

export default function Teams() {
  const loadTeams = useCallback(
    () => getJson<{ teams: Team[] }>('/api/teams').then(({ teams }) => teams),
    [],
  );

  return <CapabilityCard<Team>
    title="Teams"
    description="Manage teams and members."
    loadItems={loadTeams}
    emptyText="No teams yet."
    renderItem={(team) => `${team.name} (${team.members.length} members)`}
  />;
}
