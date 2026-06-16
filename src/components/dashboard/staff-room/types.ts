export interface StaffMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  mood: 'focused' | 'happy' | 'stressed' | 'busy';
  biography: string;
  agentId?: string;
  walletAddress?: string;
}

export interface ChatMessage {
  sender: string;
  text: string;
  actions?: { label: string; onClick: () => void }[];
  id?: string;
}

export interface StaffRoomProps {
  squadId?: string;
  onClose: () => void;
}

export interface SquadContextData {
  balance: number;
  memberCount: number;
  avgLevel: number | undefined;
  formation: string | undefined;
  members: Array<{
    name: string;
    level: number | undefined;
    matches: number | undefined;
    role: string;
  }>;
}
