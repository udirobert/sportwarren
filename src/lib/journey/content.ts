import type { JourneyStage } from '@/lib/journey/stage';

export interface JourneyPrompt {
  label: string;
  message: string;
}

export interface JourneyAction {
  label: string;
  href: string;
}

export interface JourneyZeroState {
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
}

export type JourneyZeroStateSurface =
  | 'dashboard_matches'
  | 'dashboard_squad_activity'
  | 'dashboard_next_match'
  | 'stats_locked'
  | 'stats_empty'
  | 'reputation_no_squad'
  | 'reputation_empty'
  | 'community_players'
  | 'community_squads'
  | 'community_matches';

export interface JourneyContentContext {
  city?: string;
  venue?: string;
  rivalName?: string;
}

export interface JourneyContent {
  hero: {
    primaryCtaLabel: string;
    stageLine: string;
    previewLinkLabel?: string;
    highlights: string[];
  };
  authModal: {
    title: string;
    description: string;
    benefits: string[];
    primaryActionLabel: string;
    secondaryActionLabel?: string;
  };
  assistant: {
    welcome: string;
    placeholder: string;
    prompts: JourneyPrompt[];
    tourPrompt: string;
  };
  personalization: {
    eyebrow: string;
    title: string;
    description: string;
    interestsTitle: string;
    interestsDescription: string;
    completeLabel: string;
  };
  checklist: {
    eyebrow: string;
    title: string;
    footer: string;
  };
}

const DEFAULT_CITY = 'local';
const DEFAULT_VENUE = 'your ground';
const DEFAULT_RIVAL = 'the next opponent';

export function getJourneyNavigationSubtitle(stage: JourneyStage): string {
  switch (stage) {
    case 'guest_preview':
      return 'Simulate your squad tactics and see the result';
    case 'account_ready':
      return 'Set up your tactical DNA to inspire your squad';
    case 'wallet_unverified':
      return 'Verify once to unlock deeper tactical insights';
    case 'verified_no_squad':
      return 'Create the squad your tactical vision will run through';
    case 'season_kickoff':
      return 'Invite your team to their first tactical briefing';
    case 'returning_manager':
      return 'Keep the tactical prep and match loop moving';
    case 'public_visitor':
    default:
      return 'Experience tactical depth, squad building, and on-chain results';
  }
}

export function getJourneyNextAction(stage: JourneyStage): JourneyAction {
  switch (stage) {
    case 'guest_preview':
      return { label: 'Start your own season', href: '/?connect=1' };
    case 'account_ready':
      return { label: 'Set up your tactics', href: '/match/preview' };
    case 'wallet_unverified':
      return { label: 'Verify wallet', href: '/settings?tab=wallet' };
    case 'verified_no_squad':
      return { label: 'Create squad', href: '/squad' };
    case 'season_kickoff':
      return { label: 'Team Briefing', href: '/match/briefing/next' };
    case 'returning_manager':
      return { label: 'Go to Match Center', href: '/match?mode=preview' };
    case 'public_visitor':
    default:
      return { label: 'Start your season', href: '/?connect=1' };
  }
}

export function getJourneyZeroState(
  stage: JourneyStage,
  surface: JourneyZeroStateSurface,
): JourneyZeroState {
  const nextAction = getJourneyNextAction(stage);

  switch (surface) {
    case 'dashboard_matches':
      return {
        title: 'No verified matches yet',
        description: 'The first logged result creates the proof, XP, and momentum that makes the dashboard worth revisiting.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'dashboard_squad_activity':
      return {
        title: 'No squad activity yet',
        description: 'Activity appears once you log a result, send the verification link, or bring teammates into the same season loop.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'dashboard_next_match':
      return {
        title: 'No next match scheduled',
        description: 'Preview your next match, set your tactics, and visualize your squad before scheduling.',
        actionLabel: 'Preview Match',
        actionHref: '/match/preview',
      };
    case 'stats_locked':
      return {
        title: stage === 'wallet_unverified' ? 'Verify to unlock protected stats' : 'Your verified record is not live yet',
        description: stage === 'account_ready'
          ? 'Log the first result now. Add wallet protection when you need secure progression and protected actions.'
          : stage === 'guest_preview'
            ? 'Preview users do not keep a protected record. Claim your season when you want stats that stick.'
            : 'This view becomes useful once your identity and first proof-backed result are in place.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'stats_empty':
      return {
        title: 'No verified stats yet',
        description: 'One verified result is enough to turn this into a living player record.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'reputation_no_squad':
      return {
        title: 'No squad context yet',
        description: 'Reputation compounds faster once results, invites, and proof are tied to a real squad.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'reputation_empty':
      return {
        title: 'No reputation events yet',
        description: 'Play and verify one real match to create the first contribution in your reputation timeline.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'community_players':
      return {
        title: 'No players ranked yet',
        description: 'The leaderboard starts filling as soon as verified results begin landing.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'community_squads':
      return {
        title: 'No squads listed yet',
        description: 'Create the first active squad and it becomes the team others can challenge and track.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
    case 'community_matches':
    default:
      return {
        title: 'No community matches yet',
        description: 'The community feed comes alive once the first proof-backed result is submitted.',
        actionLabel: nextAction.label,
        actionHref: nextAction.href,
      };
  }
}

export function getJourneyContent(
  stage: JourneyStage,
  context: JourneyContentContext = {},
): JourneyContent {
  const city = context.city || DEFAULT_CITY;
  const venue = context.venue || DEFAULT_VENUE;
  const rivalName = context.rivalName || DEFAULT_RIVAL;

  switch (stage) {
    case 'guest_preview':
      return {
        hero: {
          primaryCtaLabel: 'Start Your Own Season',
          stageLine: 'Try the match flow, then create an account to track real progress.',
          previewLinkLabel: 'or continue the preview',
          highlights: [
            'See the full match flow',
            'Understand how verification works',
            'Convert to a real account when ready',
          ],
        },
        authModal: {
          title: 'Claim this season',
          description: 'Turn your preview into a real account so matches, squad moves, and reputation belong to you.',
          benefits: [
            'Save progress beyond the preview session',
            'Start logging real matches immediately',
            'Unlock squad, wallet, and reputation setup when ready',
          ],
          primaryActionLabel: 'Start My Season',
          secondaryActionLabel: 'Continue preview',
        },
        assistant: {
          welcome: `Welcome to the ${city} preview. I'm Marcus, and I can show you how this turns one Sunday result at ${venue} into a season you can actually run.`,
          placeholder: 'Ask what becomes real after the preview...',
          prompts: [
            {
              label: 'What can I do in this preview?',
              message: 'What can I do in this preview before I create a real account?',
            },
            {
              label: 'How do I start my own season?',
              message: 'How do I move from the preview into my own real season?',
            },
          ],
          tourPrompt: `I'm observing the preview at ${venue}. The squad is facing ${rivalName}. Give a quick tactical read, then explain that this is a preview and the next real win is starting their own season.`,
        },
        personalization: {
          eyebrow: 'Preview Setup',
          title: 'How will your squad win?',
          description: 'Pick your formation and branding to see how your squad will look on match day.',
          interestsTitle: 'Set Your Formation',
          interestsDescription: 'Choose your tactical starting point. You can change this anytime.',
          completeLabel: 'Brand My Squad',
        },
        checklist: {
          eyebrow: 'Preview Goals',
          title: 'See the first wins clearly',
          footer: 'Preview progress is local until you claim your season',
        },
      };
    case 'account_ready':
      return {
        hero: {
          primaryCtaLabel: 'Preview Your First Match',
          stageLine: 'Set up your tactics and formation before the first match.',
          highlights: [
            'Choose your formation and play style',
            'Preview how your squad will play',
            'Then log your first match',
          ],
        },
        authModal: {
          title: 'Your Account Is Ready',
          description: 'The fastest win is logging one real match. Add a wallet when you need protected actions, treasury moves, and on-chain progression.',
          benefits: [
            'Log your first match and earn real XP',
            'Share the verification link so the result sticks',
            'Create or join a squad once your team is ready',
          ],
          primaryActionLabel: 'Start My Season',
          secondaryActionLabel: 'Add a wallet now',
        },
        assistant: {
          welcome: "Your account is ready. I'm Marcus, and the fastest way to make this worth returning to is one real result plus one verification link.",
          placeholder: 'Ask about your first match or first invite...',
          prompts: [
            {
              label: 'How do I log my first match?',
              message: 'How do I log my first match as quickly as possible?',
            },
            {
              label: 'What happens after I submit it?',
              message: 'What happens after I submit my first result?',
            },
          ],
          tourPrompt: `I'm looking at ${venue}. Give a quick tactical read on ${rivalName}, then tell the user the fastest next step is logging a real result and sharing the verification link.`,
        },
        personalization: {
          eyebrow: 'Season Kickoff',
          title: 'How will your squad win?',
          description: 'Pick your formation and branding to see how your squad will look on match day.',
          interestsTitle: 'Set Your Formation',
          interestsDescription: 'Choose your tactical starting point. You can change this anytime.',
          completeLabel: 'Brand My Squad',
        },
        checklist: {
          eyebrow: 'First Wins',
          title: 'Start your season with proof',
          footer: 'Progress is saved automatically once your account is live',
        },
      };
    case 'wallet_unverified':
      return {
        hero: {
          primaryCtaLabel: 'Verify And Continue',
          stageLine: 'One signature unlocks protected actions and squad control.',
          highlights: [
            'Unlock protected actions',
            'Secure your progression',
            'Keep treasury paths ready',
          ],
        },
        authModal: {
          title: 'Verify your wallet',
          description: 'Approve one signature to unlock protected actions while keeping the rest of your flow unchanged.',
          benefits: [
            'Approve secure squad and treasury actions',
            'Keep your session trusted across protected flows',
            'Move from setup into real team operations',
          ],
          primaryActionLabel: 'Verify wallet',
        },
        assistant: {
          welcome: 'Your wallet is connected. One verification signature unlocks protected actions without slowing down the rest of your season.',
          placeholder: 'Ask what verification unlocks...',
          prompts: [
            {
              label: 'Why do I need to verify?',
              message: 'Why do I need to verify my wallet before using protected actions?',
            },
            {
              label: 'What unlocks after verification?',
              message: 'What unlocks after I verify my wallet?',
            },
          ],
          tourPrompt: `I'm reviewing the setup around ${venue}. Explain what protected actions verification unlocks, then connect it back to taking control of the squad after the next result against ${rivalName}.`,
        },
        personalization: {
          eyebrow: 'Protected Setup',
          title: 'What should secure access unlock first?',
          description: 'Choose the workflows that matter most now that your wallet is connected and protected actions are within reach.',
          interestsTitle: 'Where should secure access pay off first?',
          interestsDescription: 'Pick the outcomes that should justify connecting the wallet in the first place.',
          completeLabel: 'Tune My Setup',
        },
        checklist: {
          eyebrow: 'Protected Setup',
          title: 'Secure the actions that matter',
          footer: 'Finish verification once and protected flows stay available',
        },
      };
    case 'verified_no_squad':
      return {
        hero: {
          primaryCtaLabel: 'Build Your Squad',
          stageLine: 'Create your squad to start tracking matches together.',
          highlights: [
            'Invite teammates',
            'Track matches together',
            'Compete as a team',
          ],
        },
        authModal: {
          title: 'Your identity is secured',
          description: 'Now create or join the squad that should accumulate match proof, invites, and reputation with you.',
          benefits: [
            'Give results a real team context',
            'Create an invite path for teammates',
            'Prepare governance and treasury features for later',
          ],
          primaryActionLabel: 'Create squad',
        },
        assistant: {
          welcome: 'Your identity is secured. Now the important move is deciding which squad should own the season you are about to build.',
          placeholder: 'Ask how to create or join a squad...',
          prompts: [
            {
              label: 'Should I create or join a squad?',
              message: 'Should I create a new squad or join an existing one first?',
            },
            {
              label: 'How do invites work?',
              message: 'How do squad invites and teammate onboarding work?',
            },
          ],
          tourPrompt: `I'm reviewing the setup at ${venue}. Give a short tactical note on ${rivalName}, then explain why creating a squad is the next move before results start compounding.`,
        },
        personalization: {
          eyebrow: 'Squad Setup',
          title: 'What should the squad experience optimize for?',
          description: 'Choose the role and first wins that should make team coordination feel worth it from the start.',
          interestsTitle: 'What should Marcus help your squad do first?',
          interestsDescription: 'Pick the outcomes that make inviting teammates the obvious next move.',
          completeLabel: 'Shape My Squad Console',
        },
        checklist: {
          eyebrow: 'Squad Setup',
          title: 'Build the team loop around your season',
          footer: 'Every completed step makes squad onboarding clearer',
        },
      };
    case 'season_kickoff':
      return {
        hero: {
          primaryCtaLabel: 'Log Your First Result',
          stageLine: 'Log a match to create proof and start your season.',
          highlights: [
            'Create the first verified result',
            'Give your squad real context',
            'Start the weekly match loop',
          ],
        },
        authModal: {
          title: 'Make the first result count',
          description: 'Everything important is in place. The next win is getting one real result verified so the season becomes real.',
          benefits: [
            'Create the first proof-backed season event',
            'Give the squad something concrete to react to',
            'Turn setup into a weekly operating loop',
          ],
          primaryActionLabel: 'Log first result',
        },
        assistant: {
          welcome: 'You are one verified result away from making this season real. I can help you choose the fastest path to that first proof-backed win.',
          placeholder: 'Ask how to make the first result count...',
          prompts: [
            {
              label: 'How do I make the first result stick?',
              message: 'How do I make sure the first result actually sticks and becomes meaningful?',
            },
            {
              label: 'What is the best first squad action?',
              message: 'What should the squad do right after the first verified result?',
            },
          ],
          tourPrompt: `I'm watching the setup at ${venue}. Break down what matters tactically against ${rivalName}, then explain how one verified result changes the squad's momentum.`,
        },
        personalization: {
          eyebrow: 'First Result',
          title: 'What should the first verified result unlock?',
          description: 'Choose the outcomes that should make the team feel immediate value once that first real match lands.',
          interestsTitle: 'What would make week one feel sticky?',
          interestsDescription: 'Pick the wins that should trigger retention after the first result.',
          completeLabel: 'Tune My Console',
        },
        checklist: {
          eyebrow: 'Season Kickoff',
          title: 'Make the first verified moment count',
          footer: 'The first proof-backed result is the beginning of the retention loop',
        },
      };
    case 'returning_manager':
      return {
        hero: {
          primaryCtaLabel: 'Open Manager Console',
          stageLine: 'Your squad is ready. Get back to logging matches.',
          highlights: [
            'Review what needs attention',
            'Log the next result',
            'Coordinate your squad',
          ],
        },
        authModal: {
          title: 'Open the squad console',
          description: 'You are past onboarding. The important thing now is keeping operations, communication, and match flow moving week to week.',
          benefits: [
            'Clear pending actions quickly',
            'Keep the next result from stalling',
            'Use one operating layer for the whole squad',
          ],
          primaryActionLabel: 'Open dashboard',
        },
        assistant: {
          welcome: 'Welcome back. I can help you clear the queue, plan the next match, and keep the squad active this week.',
          placeholder: 'Ask what needs attention today...',
          prompts: [
            {
              label: 'What needs my attention today?',
              message: 'What should I focus on today to keep the squad moving?',
            },
            {
              label: 'How do I keep the squad active this week?',
              message: 'How do I keep the squad active and engaged this week?',
            },
          ],
          tourPrompt: `I'm reviewing the live squad context at ${venue}. Give a quick tactical read on ${rivalName}, then suggest the next manager action that keeps weekly momentum going.`,
        },
        personalization: {
          eyebrow: 'Manager Console',
          title: 'What should this console optimize now?',
          description: 'Set the priorities that should keep your weekly operating loop fast, clear, and worth returning to.',
          interestsTitle: 'What should Marcus bias toward?',
          interestsDescription: 'Choose the areas where you want more signal and less noise.',
          completeLabel: 'Tune My Console',
        },
        checklist: {
          eyebrow: 'Manager Console',
          title: 'Keep the season moving',
          footer: 'Finished setup reduces drag in the weekly loop',
        },
      };
    case 'public_visitor':
    default:
      return {
        hero: {
          primaryCtaLabel: 'Log Your First Match',
          stageLine: 'Every match. Every stat. Forever.',
          previewLinkLabel: 'or take the tour',
          highlights: [
            'Log matches in 30 seconds',
            'Stats that level up like FIFA',
            'Banter with AI coaches. Relive the highlights.',
          ],
        },
        authModal: {
          title: 'Stop ghost games.',
          description: 'Every goal. Every assist. Every clean sheet. Tracked, verified, and yours forever. Log the match. See your stats level up. Get roasted by AI coaches. Your kickabouts just got an upgrade.',
          benefits: [
            'Track every banger',
            'Level up your squad',
            'Turn matches into memories that actually stick',
          ],
          primaryActionLabel: 'Get Started Free',
          secondaryActionLabel: 'Explore preview',
        },
        assistant: {
          welcome: "I'm here to make your footy matches more legendary — before, during, and after the final whistle.",
          placeholder: 'Ask about recording a result...',
          prompts: [
            {
              label: 'What does this app actually do?',
              message: 'What does this app actually do for a Sunday league player or organizer?',
            },
            {
              label: 'What is the first real win?',
              message: 'What is the first real win I should expect from the product?',
            },
          ],
          tourPrompt: `I'm observing the scene at ${venue}. Give a quick tactical read on ${rivalName}, then explain how one real result becomes the start of a full season workflow.`,
        },
        personalization: {
          eyebrow: 'Season Kickoff',
          title: 'How do you want to win first?',
          description: 'Set the role and first outcomes that should make the product instantly useful once you start.',
          interestsTitle: 'What should Marcus optimize first?',
          interestsDescription: 'Choose the moments that would make you come back next week.',
          completeLabel: 'Set Up My Kickoff',
        },
        checklist: {
          eyebrow: 'First Wins',
          title: 'Start your season with proof',
          footer: 'Progress is saved automatically once your account is live',
        },
      };
  }
}
