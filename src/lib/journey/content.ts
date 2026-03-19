import type { JourneyStage } from '@/lib/journey/stage';

export interface JourneyPrompt {
  label: string;
  message: string;
}

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
          stageLine: 'This is a live preview. Explore the flow, then create your own account when you want real progress to stick.',
          previewLinkLabel: 'or continue the live preview',
          highlights: [
            'See the full match flow before committing',
            'Understand how verification makes results stick',
            'Convert preview progress into a real season when ready',
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
          title: 'What would make this worth coming back to?',
          description: 'Pick the role and first wins that would convince you this should become your real weekly workflow.',
          interestsTitle: 'What should we optimize first?',
          interestsDescription: 'Choose the moments that would make the product feel sticky from week one.',
          completeLabel: 'Shape My Preview',
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
          primaryCtaLabel: 'Continue Your Kickoff',
          stageLine: 'Your account is ready. The fastest way to feel the product is to log one real match and send the verification link.',
          highlights: [
            'Log your first result in under a minute',
            'Send one opponent verification link',
            'Create the first piece of real season proof',
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
          title: 'How do you want to win first?',
          description: 'Set the role and first outcomes that should make the product immediately useful after your first match.',
          interestsTitle: 'What should Marcus optimize first?',
          interestsDescription: 'Choose the actions that would make you come back next week.',
          completeLabel: 'Set Up My Kickoff',
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
          stageLine: 'Your wallet is connected. One signature unlocks protected actions, secure progression, and squad control.',
          highlights: [
            'Unlock protected squad actions',
            'Secure season progression to your wallet',
            'Keep treasury and governance paths ready',
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
          stageLine: 'Identity is secured. The next compounding step is creating the squad your season will run through.',
          highlights: [
            'Create the team container for every result',
            'Invite teammates into the same season loop',
            'Turn individual matches into shared momentum',
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
          stageLine: 'You have the essentials in place. One verified result creates the proof, reputation, and momentum that make the product sticky.',
          highlights: [
            'Create the first verified proof point',
            'Give Marcus real match context to work with',
            'Start the loop that brings teammates back weekly',
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
          stageLine: 'The squad is live. Jump back into the queue, clear blockers, and keep weekly momentum moving.',
          highlights: [
            'Review what needs attention right now',
            'Log the next result before momentum cools',
            'Coordinate the squad from one control surface',
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
          primaryCtaLabel: 'Start Your Season',
          stageLine: 'Start free, log one real match, and feel how verified progression changes the way a Sunday team stays organized.',
          previewLinkLabel: 'or explore the live preview',
          highlights: [
            'Log your first match in under a minute',
            'Send one verification link to the other captain',
            'Build a season-long reputation your squad can trust',
          ],
        },
        authModal: {
          title: 'Start your season',
          description: 'Create your account, log one real match, and turn weekly Sunday games into proof, reputation, and squad momentum.',
          benefits: [
            'Start free with social sign-in',
            'Log your first result before connecting a wallet',
            'Unlock wallet, squad, and reputation layers when you need them',
          ],
          primaryActionLabel: 'Get Started Free',
          secondaryActionLabel: 'Explore preview',
        },
        assistant: {
          welcome: "I'm Marcus. I can show you how SportWarren turns one Sunday result into a season you can prove, revisit, and run with your squad.",
          placeholder: 'Ask how this becomes sticky after week one...',
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
