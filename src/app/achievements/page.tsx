import { redirect } from "next/navigation";

// /achievements is consolidated into /reputation — achievement context lives in the Reputation hub
export default function AchievementsPage() {
  redirect("/reputation");
}
