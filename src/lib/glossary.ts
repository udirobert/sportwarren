/**
 * SportWarren Plain-Language Glossary
 * Maps technical terms to user-friendly alternatives
 */

export const GLOSSARY_TERMS = {
  // Core terms
  XP: {
    term: "XP",
    label: "Points",
    description: "Your score that increases as you play matches and help your team.",
    category: "gameplay",
  },
  CRE: {
    term: "CRE",
    label: "Match Record",
    description: "A verified record of a completed game stored on the blockchain.",
    category: "blockchain",
  },
  "Squad DAO": {
    term: "Squad DAO",
    label: "Team Group",
    description: "A decentralized team you can join to play together and share rewards.",
    category: "social",
  },
  "Digital Twin": {
    term: "Digital Twin",
    label: "Player Profile",
    description: "Your on-chain identity that tracks your stats and achievements.",
    category: "identity",
  },
  Reputation: {
    term: "Reputation",
    label: "Rating",
    description: "Your trustworthiness score based on verified match results.",
    category: "identity",
  },
  Scout: {
    term: "Scout",
    label: "Rater",
    description: "A player who rates teammates' performance after matches.",
    category: "gameplay",
  },
  Settlement: {
    term: "Settlement",
    label: "Points Distribution",
    description: "The process of awarding XP and ratings after a match is verified.",
    category: "blockchain",
  },
  Verification: {
    term: "Verification",
    label: "Confirmation",
    description: "When both teams confirm a match result to make it official.",
    category: "gameplay",
  },
  Consensus: {
    term: "Consensus",
    label: "Agreement",
    description: "When enough players agree on a match result to finalize it.",
    category: "blockchain",
  },
  Leaderboard: {
    term: "Leaderboard",
    label: "Rankings",
    description: "See how you and other players compare based on points and ratings.",
    category: "social",
  },
} as const;

export type GlossaryTermId = keyof typeof GLOSSARY_TERMS;
export type GlossaryTerm = (typeof GLOSSARY_TERMS)[GlossaryTermId];
export type GlossaryCategory = GlossaryTerm["category"];

/**
 * Get the plain-language label for a term
 */
export function getPlainLabel(termId: GlossaryTermId): string {
  return GLOSSARY_TERMS[termId]?.label ?? termId;
}

/**
 * Get the full glossary entry for a term
 */
export function getGlossaryEntry(termId: GlossaryTermId): GlossaryTerm | undefined {
  return GLOSSARY_TERMS[termId];
}

/**
 * Get all terms in a category
 */
export function getTermsByCategory(category: GlossaryCategory): GlossaryTerm[] {
  return Object.values(GLOSSARY_TERMS).filter((term) => term.category === category);
}

/**
 * Categories for organizing help content
 */
export const GLOSSARY_CATEGORIES = {
  gameplay: {
    label: "Gameplay",
    icon: "🎮",
    terms: ["XP", "Scout", "Verification", "Consensus"],
  },
  identity: {
    label: "Your Profile",
    icon: "👤",
    terms: ["Digital Twin", "Reputation"],
  },
  blockchain: {
    label: "Blockchain",
    icon: "⛓️",
    terms: ["CRE", "Settlement"],
  },
  social: {
    label: "Teams",
    icon: "👥",
    terms: ["Squad DAO", "Leaderboard"],
  },
} as const;