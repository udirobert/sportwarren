export function buildHelpText(): string {
  return `📋 *Available Commands*

*Primary*
/start - Link or view your squad
/help - Show this help

*Squad Commands*
/squad log <score> - Submit match result
/squad stats - View squad stats
/rsvp yes/no - Confirm next match
/paid - Mark yourself as paid
/squad available yes/no - Set weekly preference
/squad roster - View availability list

*Account Commands*
/account app - Open Mini App
/account profile - View profile
/account myteams - View all your squads
/account link - Link Telegram to SportWarren
/account unlink - Unlink Telegram

*AI Staff*
/ask <question> - Ask AI Staff

*Treasury (Captains)*
/treasury view - View treasury
/treasury fee <matchId> [amount] - Propose match fee

_Use /start to get started_`;
}

export function buildWelcomeMessage(): string {
  return [
    "Stop playing ghost matches.",
    "",
    "Log the score. Track your stats. Build your legacy.",
    "Every match. Every stat. Forever.",
    "",
    "Commands:",
    "/squad log 4-2 win vs Red Lions",
    "/squad stats — Squad Stats",
    "/squad fixtures — Upcoming Matches",
    "/account app — Open Mini App",
    "/account profile — Your Stats",
    "/ask coach — AI Analysis",
    "/treasury — Squad Economy",
    "/help — Show all commands",
    "",
    "Linking:",
    "Captains can link group chats from Settings > Connections > Telegram for squad-wide commands.",
  ].join("\n");
}
