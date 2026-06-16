import type { StaffMember } from './types';

export const STAFF_MEMBERS: StaffMember[] = [
  {
    id: 'agent-1',
    name: 'Marcus',
    role: 'Academy Director',
    avatar: '🎩',
    mood: 'focused',
    biography:
      'Specializes in reputation-based valuations. Always looking for the next player who can change a season.',
    agentId: 'KITE-MARCUS-SW-01',
    walletAddress: '0x1a2b...3c4d',
  },
  {
    id: 'scout-1',
    name: 'The Scout',
    role: 'Talent Identification',
    avatar: '🔭',
    mood: 'busy',
    biography:
      'Tracks emerging prospects, squad gaps, and match load to spot the next useful addition.',
    agentId: 'KITE-SCOUT-SW-02',
    walletAddress: '0x2b3c...4d5e',
  },
  {
    id: 'coach-1',
    name: 'Coach Kite',
    role: 'Tactical Director',
    avatar: '🪁',
    mood: 'happy',
    biography: 'AI-driven tactical analyst. Thinks in nodes and probability matrices.',
    agentId: 'KITE-KITE-SW-03',
    walletAddress: '0x3c4d...5e6f',
  },
  {
    id: 'physio-1',
    name: 'The Physio',
    role: 'Health & Recovery',
    avatar: '🏥',
    mood: 'focused',
    biography:
      'Specializes in biometric recovery and injury prevention. Monitors real-world activity levels via the Phygital link.',
    agentId: 'KITE-PHYSIO-SW-04',
    walletAddress: '0x4d5e...6f7g',
  },
  {
    id: 'comms-1',
    name: 'Commercial Lead',
    role: 'Sponsorships & PR',
    avatar: '📈',
    mood: 'happy',
    biography:
      'Maximizes Lens-based reputation for brand deals. Thinks every tackle is a marketing opportunity.',
    agentId: 'KITE-COMMS-SW-05',
    walletAddress: '0x5e6f...7g8h',
  },
];
