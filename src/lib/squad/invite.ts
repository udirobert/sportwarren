export function buildSquadInvitePath(squadId: string): string {
  return `/join/${encodeURIComponent(squadId)}`;
}

export function buildSquadInviteUrl(squadId: string): string {
  const relative = buildSquadInvitePath(squadId);
  if (typeof window === 'undefined') {
    return relative;
  }

  return `${window.location.origin}${relative}`;
}
