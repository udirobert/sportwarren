import type { ChatMessage } from './types';
import { reputationTierLabel, calcMarketValuation } from './utils';

/** Squad member shape for chat responses. */
export interface ChatResponseMember {
  id: string;
  name: string;
  role: string;
  position?: string;
  stats?: { level: number; matches: number; goals: number };
}

/** Data available to chat response handlers. */
export interface ChatResponseContext {
  treasury: { balance: number; transactions?: unknown[] } | null;
  members: readonly ChatResponseMember[];
  activeFormation: string | null;
  averageLevel: number;
  highLoadMembers: readonly ChatResponseMember[];
  freshMembers: readonly ChatResponseMember[];
  developmentMembers: readonly ChatResponseMember[];
  contractCandidates: readonly ChatResponseMember[];
  rotationGap: number;
  missingPositions: string[];
  hasLiveMembers: boolean;
  yellowSessionStatus: string;
}

/** Callbacks for actions that modify UI state. */
export interface ChatResponseCallbacks {
  setChatHistory: (updater: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setIsTyping: (v: boolean) => void;
  setIsNegotiationOpen: (v: boolean) => void;
  setNegotiatingPlayer: (v: string) => void;
  setNegotiatingWage: (v: number) => void;
  agentDispatch: (action: { type: string; payload?: any }) => void;
}

interface PredefinedResponse {
  handled: true;
  delay: number;
}

type ResponseResult = PredefinedResponse | null;

/**
 * Attempt to handle a predefined staff action.
 * Returns { handled: true } if the message was a predefined action,
 * or null if it should fall through to the LLM.
 */
export function handlePredefinedResponse(
  text: string,
  staffName: string,
  ctx: ChatResponseContext,
  callbacks: ChatResponseCallbacks,
): ResponseResult {
  const { treasury, members, activeFormation, averageLevel, highLoadMembers, freshMembers, developmentMembers, contractCandidates, rotationGap, missingPositions, hasLiveMembers, yellowSessionStatus } = ctx;
  const { setChatHistory, setIsTyping, setIsNegotiationOpen, setNegotiatingPlayer, setNegotiatingWage, agentDispatch } = callbacks;

  const addStaffMessage = (msgText: string, actions?: ChatMessage['actions']) => {
    setChatHistory((prev) => [...prev, { sender: staffName, text: msgText, actions }]);
  };

  const yesNoActions = (confirmText: string, declineText: string): ChatMessage['actions'] => [
    { label: `✅ ${confirmText}`, onClick: () => addStaffMessage(`Done. ${confirmText}.`) },
    { label: `❌ ${declineText}`, onClick: () => addStaffMessage(`Understood. ${declineText}.`) },
  ];

  if (text === 'Transfer Budget Inquiry') {
    const balance = treasury?.balance || 0;
    setTimeout(() => {
      addStaffMessage(
        `Let me check the books, Boss.\n\n💰 Current Transfer Budget: ${balance.toLocaleString()} credits\n📊 Budget Health: ${balance >= 5000 ? '🟢 Strong — room to move in the market.' : balance >= 2000 ? '🟡 Moderate — be selective.' : '🔴 Tight — prioritise contract renewals over new signings.'}\n\n${balance >= 5000 ? "We're in a good position to make a move if the right player comes up." : "I'd recommend holding off on any big signings until we secure a sponsorship deal or match prize."}\n\nWant me to identify the best value targets within our current budget?`,
        [
          { label: '✅ Show Value Targets', onClick: () => addStaffMessage("Based on our budget, I'm flagging three targets: a Silver-tier midfielder at 1,800 credits, a Bronze striker at 900 credits, and a free agent goalkeeper. I'll have full dossiers ready within the hour.") },
          { label: '❌ Not Right Now', onClick: () => addStaffMessage('The budget is there when you need it. Come back to me when you\'re ready to move.') },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Balance Sheet Review') {
    const txCount = treasury?.transactions?.length || 0;
    setTimeout(() => {
      addStaffMessage(
        `Here's the full financial picture, Boss.\n\n📋 Recent Transactions: ${txCount}\n💸 Biggest Outgoing: Squad wages (weekly drain)\n💰 Biggest Incoming: Last match prize money\n📈 Net Position: ${txCount > 5 ? 'Active — lots of movement this cycle.' : 'Quiet — relatively stable.'}\n\n${txCount > 10 ? '⚠️ High transaction volume. Worth reviewing for any anomalies.' : '✅ Books look clean. No red flags.'}\n\nShall I flag any transactions that look out of the ordinary?`,
        [
          { label: '✅ Flag Anomalies', onClick: () => addStaffMessage("I've run the audit. No major anomalies detected. One duplicate entry on a training fee — I'll get that corrected. Everything else checks out.") },
          { label: '❌ Looks Fine', onClick: () => addStaffMessage("Noted. I'll keep the books tidy and flag anything unusual as it comes in.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text.includes('Renegotiate') && text.includes('Contract')) {
    const playerName = text.replace('Renegotiate ', '').replace("'s Contract", '');
    setNegotiatingPlayer(playerName);
    const liveMember = members?.find((m) => m.name.split(' ')[0] === playerName);
    const liveLevel = liveMember?.stats?.level ?? 5;
    const liveMatches = liveMember?.stats?.matches ?? 0;
    const wage = Math.max(200, liveLevel * 80 + liveMatches * 2);
    const weeksRemaining = liveMember ? Math.max(2, 48 - liveMatches) : 12;
    const reputationTier = reputationTierLabel(liveLevel * 50);
    const marketValuation = calcMarketValuation(liveLevel, liveLevel * 50);
    const position = liveMember?.role === 'captain' ? 'CAP' : 'Player';
    setNegotiatingWage(wage);
    const urgency = weeksRemaining <= 6 ? '🔴 URGENT' : weeksRemaining <= 12 ? '🟡 SOON' : '🟢 STABLE';
    const recommendation =
      weeksRemaining <= 6
        ? 'I strongly recommend we act now — we risk losing them on a free if we wait.'
        : weeksRemaining <= 12
          ? 'We have a window, but rival clubs are circling. Better to move soon.'
          : 'No immediate pressure, but locking them in now avoids future inflation.';
    setTimeout(() => {
      addStaffMessage(
        `Right, let me pull up ${playerName}'s file.\n\n📋 Current Wage: ${wage.toLocaleString()} credits/wk\n⏳ Contract Status: ${urgency} — ${weeksRemaining} weeks remaining of 48\n📊 Role: ${position}\n🏅 Reputation Tier: ${reputationTier}\n💰 Market Valuation: ${marketValuation.toLocaleString()} credits\n🎯 Matches Played: ${liveMatches}\n\n${recommendation}\n\nShall I open the negotiation table, Boss?`,
        [
          { label: '✅ Open Negotiations', onClick: () => setIsNegotiationOpen(true) },
          { label: '❌ Leave it for now', onClick: () => addStaffMessage("Understood, Boss. I'll keep monitoring the situation. Come back to me when you're ready.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Squad Morale Check') {
    const moraleStatus = averageLevel >= 7 ? '🟢 HIGH' : averageLevel >= 4 ? '🟡 STEADY' : '🔴 LOW';
    const memberSummary = hasLiveMembers
      ? members.slice(0, 4).map((m) => `• ${m.name} — Lvl ${m.stats?.level ?? 1} (${m.stats?.matches ?? 0} matches)`).join('\n')
      : '• No live squad data available yet';
    setTimeout(() => {
      addStaffMessage(
        hasLiveMembers
          ? `Right, let me pull the morale data.\n\n🧠 Squad Avg Level: ${averageLevel}\n📊 Morale Status: ${moraleStatus}\n\n${memberSummary}\n\n💬 Dressing Room Vibe: ${averageLevel >= 7 ? 'The group looks confident and ready for a sharper tactical push.' : averageLevel >= 4 ? 'Steady. They can improve quickly if we keep the next session focused.' : 'Fragile. The next session needs to rebuild confidence before the next fixture.'}\n\n${highLoadMembers.length > 0 ? `⚠️ Rotation watch: ${highLoadMembers.slice(0, 2).map((m) => m.name).join(', ')} are carrying the heaviest load.` : 'No immediate rotation pressure showing in the live squad data.'}\n\nWant me to schedule a morale-boosting training session, Boss?`
          : "I can't score morale properly until the live squad record is loaded. Once members, matches, and levels are available, I'll give you a proper dressing-room read.",
        [
          { label: '✅ Schedule Session', onClick: () => addStaffMessage("Done. I've blocked out Thursday morning for a light tactical session with a team bonding element. The lads will appreciate it.") },
          { label: '❌ Leave it for now', onClick: () => addStaffMessage('Understood. I\'ll keep monitoring. Come back to me if the numbers dip further.') },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Tactical Briefing') {
    const recommendedFormation = members.length >= 7 ? '4-3-3' : '4-4-2';
    const formation = activeFormation || recommendedFormation;
    const tacticalRisk = highLoadMembers.length >= 2 ? 'High-press shapes will stretch your current high-load players.' : 'The current load profile can support a more aggressive press.';
    const tacticalRead =
      rotationGap > 0
        ? `We're still ${rotationGap} player${rotationGap > 1 ? 's' : ''} short of full rotation depth, so stability matters more than complexity right now.`
        : 'Depth is good enough to support a more assertive structure next match.';
    setTimeout(() => {
      addStaffMessage(
        `Here's the current tactical picture, Boss.\n\n🗂️ Active Shape: ${formation}\n👥 Available Core: ${members.length} live squad members\n⚠️ Load Note: ${tacticalRisk}\n\n💡 My Read: ${activeFormation ? `You've already saved ${formation}, so the job now is tuning roles and rotation.` : `No saved formation is on record, so I'd start with ${formation} as the first stable base.`}\n\n${tacticalRead}\n\nShall I apply ${formation} as the working setup for the next fixture?`,
        [
          { label: '✅ Apply Formation', onClick: () => { agentDispatch({ type: 'SET_FORMATION', payload: { formation, winRate: 64 } }); addStaffMessage(`Formation locked in. I've set ${formation} as the working shape and adjusted the prep notes for the next session.`); } },
          { label: '❌ Keep Current Setup', onClick: () => addStaffMessage("Noted. We'll keep the current setup and revisit once more live match data lands.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Training Optimization') {
    const highLoadNames = highLoadMembers.length > 0 ? highLoadMembers.slice(0, 2).map((m) => m.name).join(', ') : 'none flagged';
    const freshNames = freshMembers.length > 0 ? freshMembers.map((m) => m.name).join(', ') : 'no clear freshness edge yet';
    const developmentNames = developmentMembers.length > 0 ? developmentMembers.map((m) => m.name).join(', ') : 'no developing group identified yet';
    setTimeout(() => {
      addStaffMessage(
        hasLiveMembers
          ? `I've run the load analysis across the squad.\n\n🏋️ High Load Players: ${highLoadNames}\n🟢 Fresh & Ready: ${freshNames}\n📉 Development Focus: ${developmentNames}\n\nRecommendation: ${highLoadMembers.length > 0 ? 'Reduce intensity for the highest-load group and shift the next high-intensity block to the fresher players.' : 'The load profile is stable. Use the next session to sharpen combinations and build confidence.'}\n\nShall I restructure this week's training plan accordingly?`
          : "I need live member and training data before I can optimise the weekly load properly. Once the squad record is available, I'll split the group into high-load, fresh, and development cohorts.",
        [
          { label: '✅ Restructure Plan', onClick: () => addStaffMessage(hasLiveMembers ? `Training plan updated. ${highLoadMembers.length > 0 ? `${highLoadMembers.slice(0, 2).map((m) => m.name).join(' and ')} are on managed load` : 'The whole squad stays on normal load'}, while ${freshMembers.length > 0 ? freshMembers.map((m) => m.name).join(' and ') : 'the freshest group'} carry the sharpness work.` : "Understood. I'll wait for the live squad record, then rebuild the weekly plan from actual load data.") },
          { label: '❌ Keep Current Plan', onClick: () => addStaffMessage("Understood. I'll flag it again if fatigue levels worsen before the weekend.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Squad Coverage Review') {
    const coverageLine = missingPositions.length > 0 ? `Priority gaps: ${missingPositions.join(', ')}` : 'Core positions are covered in the current squad record.';
    const contractLine = contractCandidates.length > 0
      ? contractCandidates.map((m) => `• ${m.name} — ${m.stats?.matches ?? 0} matches, Lvl ${m.stats?.level ?? 1}`).join('\n')
      : '• No members loaded yet';
    setTimeout(() => {
      addStaffMessage(
        hasLiveMembers
          ? `I've run the squad coverage review, Boss.\n\n👥 Live Squad Size: ${members.length}\n📉 Rotation Gap: ${rotationGap}\n🎯 ${coverageLine}\n\n${contractLine}\n\nRecommendation: ${missingPositions.length > 0 ? `Start by scouting ${missingPositions[0]} depth before you make luxury moves.` : 'Focus on upgrading quality, not just adding bodies.'}\n\nWant me to queue a scouting brief?`
          : "I need the live squad record before I can map coverage properly. Once members and positions are loaded, I'll show you the real gaps and priorities.",
        [
          { label: '✅ Queue Scouting Brief', onClick: () => addStaffMessage(hasLiveMembers ? `Scouting brief queued. I'll prioritise ${missingPositions[0] || 'quality upgrades'} and bring back the cleanest options first.` : "Understood. I'll wait for live squad data, then generate the scouting brief from actual gaps.") },
          { label: '❌ Hold Position', onClick: () => addStaffMessage("Understood. I'll keep the watchlist warm and wait for a clearer need.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Scouting Priority Report') {
    const budgetTier = (treasury?.balance ?? 0) >= 5000 ? 'strong' : (treasury?.balance ?? 0) >= 2000 ? 'selective' : 'tight';
    setTimeout(() => {
      addStaffMessage(
        `Here's the scouting priority report, Boss.\n\n💰 Budget posture: ${budgetTier}\n👥 Rotation gap: ${rotationGap}\n🎯 Position priority: ${missingPositions.length > 0 ? missingPositions.join(', ') : 'best-player-available'}\n\n${budgetTier === 'tight' ? 'Recommendation: lean on draft signals and low-cost opportunities first.' : budgetTier === 'selective' ? 'Recommendation: one targeted move beats three speculative ones.' : 'Recommendation: you have room to move, so target the position that most improves your first XI.'}\n\nWant me to open the prospect board with that priority order?`,
        [
          { label: '✅ Open Prospect Board', onClick: () => addStaffMessage(`Prospect board prioritised. First lane is ${missingPositions[0] || 'quality upgrades'}, then depth coverage, then opportunistic value.`) },
          { label: '❌ Wait for More Data', onClick: () => addStaffMessage("Fair enough. I'll hold until another result or squad change gives us a sharper signal.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Opponent Prep Checklist') {
    setTimeout(() => {
      addStaffMessage(
        "I don't have a live opponent dossier loaded yet, Boss, so here's the prep checklist built from our own squad state.\n\n1. Confirm the next opponent in Match Center.\n2. Lock the working shape: " + (activeFormation || 'no saved formation yet') + '.\n3. Review high-load players: ' + (highLoadMembers.length > 0 ? highLoadMembers.slice(0, 2).map((m) => m.name).join(', ') : 'none flagged') + '.\n4. Bring one evidence plan into the fixture: scoreline, GPS, and captain confirmation.\n\nOnce the opponent is locked and the match record exists, I can give you a proper opposition brief.',
        [
          { label: '✅ Prepare Checklist', onClick: () => addStaffMessage("Checklist prepared. Once you lock the opponent in Match Center, I'll tighten this into a real briefing.") },
          { label: '❌ Not Needed', onClick: () => addStaffMessage("No problem. We'll wait until the fixture is properly on the board.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Fitness Status Report') {
    const fitnessLines = members?.length
      ? members.map((m) => {
          const lvl = m.stats?.level ?? 1;
          const matches = m.stats?.matches ?? 0;
          const risk = matches > 30 ? '🔴 High' : matches > 15 ? '🟡 Medium' : '🟢 Low';
          const recovery = matches > 30 ? ' (rest recommended)' : '';
          return `${risk} ${m.name} — Lvl ${lvl}${recovery}`;
        })
      : ['No live fitness data loaded yet'];
    const atRisk = members?.length ? members.filter((m) => (m.stats?.matches ?? 0) > 15).length : 0;
    setTimeout(() => {
      addStaffMessage(
        hasLiveMembers
          ? `I've run the full biometric sweep, Boss. Here's the picture.\n\n${fitnessLines.join('\n')}\n\n${atRisk > 0 ? `⚠️ ${atRisk} player(s) need attention before the next fixture.` : '✅ Squad is in excellent shape.'}\n\nShall I update the match selection availability list accordingly?`
          : "I can't produce a real fitness report until the live squad record is loaded. Once match load and members are in, I'll flag who's fit, who's being monitored, and who needs rotation.",
        [
          { label: '✅ Update Availability', onClick: () => addStaffMessage(hasLiveMembers ? `Availability list updated. ${highLoadMembers.length > 0 ? `${highLoadMembers.slice(0, 2).map((m) => m.name).join(' and ')} are marked for load monitoring.` : 'Everyone is cleared from the current live record.'}` : "Understood. I'll update availability once the live squad data lands.") },
          { label: "❌ I'll Handle It", onClick: () => addStaffMessage("Understood. The data is here whenever you need it. I'll flag anything urgent immediately.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Recovery Logistics') {
    const averageMatches = hasLiveMembers ? Math.round(members.reduce((t, m) => t + (m.stats?.matches ?? 0), 0) / members.length) : 0;
    setTimeout(() => {
      addStaffMessage(
        hasLiveMembers
          ? `Post-match recovery analysis is in, Boss.\n\n📊 Average match load: ${averageMatches}\n⚠️ Managed recovery needed: ${highLoadMembers.length > 0 ? highLoadMembers.slice(0, 2).map((m) => m.name).join(', ') : 'no one flagged'}\n🟢 Lowest load group: ${freshMembers.length > 0 ? freshMembers.map((m) => m.name).join(', ') : 'none separated yet'}\n\nOverall the squad is ${highLoadMembers.length > 0 ? 'recovering, but we need to manage the top-load group carefully.' : 'recovering cleanly from the current schedule.'}\n\nShall I adjust the recovery schedule?`
          : "I can't map recovery properly without the live squad and match-load data. Once that's loaded, I'll identify who needs managed recovery and who can push on.",
        [
          { label: '✅ Adjust Schedule', onClick: () => addStaffMessage(hasLiveMembers ? `Done. ${highLoadMembers.length > 0 ? `${highLoadMembers.slice(0, 2).map((m) => m.name).join(' and ')} are on reduced load for the next block.` : 'The recovery schedule is now balanced against the current squad data.'}` : "Understood. I'll wait for live data, then rebuild the recovery schedule.") },
          { label: '❌ Keep Current Schedule', onClick: () => addStaffMessage("Noted. I'll monitor closely and escalate if the live risk profile worsens.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Injury Prevention') {
    const highestRiskMember = highLoadMembers[0] || members[0];
    setTimeout(() => {
      addStaffMessage(
        hasLiveMembers
          ? `I've run the predictive injury model across the squad.\n\n🔴 Highest Risk: ${highestRiskMember ? `${highestRiskMember.name} — ${highestRiskMember.stats?.matches ?? 0} matches logged` : 'No single player flagged'}\n🟡 Watch List: ${highLoadMembers.length > 1 ? highLoadMembers.slice(1, 3).map((m) => m.name).join(', ') : 'No wider watch list from live data'}\n🟢 Low Risk: ${members.length - Math.min(highLoadMembers.length, members.length)} player(s)\n\nIf we act now, we can keep soft-tissue risk from compounding into the next fixture.\n\nShall I start a prevention protocol?`
          : "I need live load data before I can run a real injury-prevention model. Once the squad record is synced, I'll identify the highest-risk players properly.",
        [
          { label: '✅ Start Protocol', onClick: () => { if (highestRiskMember) { agentDispatch({ type: 'SET_INJURY', payload: { playerName: highestRiskMember.name, riskLevel: 'High', recoveryDays: 7 } }); } addStaffMessage(hasLiveMembers && highestRiskMember ? `Prevention protocol activated for ${highestRiskMember.name}. They're on reduced load, targeted physio, and daily monitoring until the risk score drops.` : "Understood. I'll hold the protocol plan until the live data is available."); } },
          { label: '❌ Not Yet', onClick: () => addStaffMessage("Understood. I'll keep the flags live and escalate if the risk score increases. Don't leave it too long, Boss.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Commercial Readiness') {
    const budgetBalance = treasury?.balance ?? 0;
    const revenueFocus =
      budgetBalance < 1500
        ? 'Revenue is urgent. The squad needs new inflow before the next aggressive move.'
        : budgetBalance < 4000
          ? 'Revenue is useful. One sponsor or community push would materially improve flexibility.'
          : 'Revenue is healthy enough that you can be selective and protect brand quality.';
    setTimeout(() => {
      addStaffMessage(
        `Here's the commercial readiness read, Boss.\n\n💰 Treasury balance: ${budgetBalance.toLocaleString()} credits\n👥 Active squad: ${members.length} members\n🔐 Payment rail: ${yellowSessionStatus === 'authenticated' ? 'ready for live settlement' : 'not fully authenticated yet'}\n\n${revenueFocus}\n\nWant me to draft a sponsor brief around the current squad story?`,
        [
          { label: '✅ Draft Sponsor Brief', onClick: () => addStaffMessage("Sponsor brief drafted. I centred it on squad growth, verified results, and the next visible milestone.") },
          { label: '❌ Not Yet', onClick: () => addStaffMessage("Understood. I'll wait until the squad story or treasury position changes.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Growth Priorities') {
    const priority =
      rotationGap > 0
        ? `close the ${rotationGap}-player rotation gap`
        : (treasury?.balance ?? 0) < 3000
          ? 'strengthen treasury and commercial headroom'
          : 'turn verified results into public momentum';
    setTimeout(() => {
      addStaffMessage(
        `I've ranked the next growth priorities, Boss.\n\n1. ${priority}\n2. Keep verification flowing so progress is visible.\n3. Package the next milestone into a squad update once it lands.\n\nThat sequence gives us the clearest path from early traction into retention and referral.\n\nWant me to lock those priorities in?`,
        [
          { label: '✅ Lock Priorities', onClick: () => addStaffMessage(`Priorities locked. I'll align the next commercial and community prompts around ${priority}.`) },
          { label: '❌ Leave Flexible', onClick: () => addStaffMessage("Understood. We'll stay opportunistic and reassess after the next squad action.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  if (text === 'Community Update Plan') {
    setTimeout(() => {
      addStaffMessage(
        `Here's the community update plan, Boss.\n\n🎯 Lead with: ${members.length > 0 ? `${members.length}-member squad progress` : 'the next verified match result'}\n📣 Follow with: ${missingPositions.length > 0 ? `the search for ${missingPositions.join(', ')} depth` : 'the next tactical or treasury milestone'}\n🔁 CTA: invite rivals or teammates to verify and join the loop\n\nThis keeps the story grounded in real progression instead of filler metrics.\n\nWant me to queue the draft post?`,
        [
          { label: '✅ Queue Draft Post', onClick: () => { agentDispatch({ type: 'QUEUE_ONCHAIN_ACTION', payload: { id: `lens-${Date.now()}`, type: 'lens_post', description: 'Publish the next squad progress update', postText: `Squad update: ${members.length > 0 ? `${members.length} active members and the next focus is ${missingPositions[0] || 'verified results'}.` : 'The next verified result will define the squad story.'} #SportWarren` } }); addStaffMessage("Draft queued. Review the post and sign it when you're ready to publish the next real milestone."); } },
          { label: '❌ Hold the Update', onClick: () => addStaffMessage("Understood. We'll wait until the next milestone gives us a stronger story to publish.") },
        ],
      );
      setIsTyping(false);
    }, 1500);
    return { handled: true, delay: 1500 };
  }

  return null;
}
