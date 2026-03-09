import { redirect } from "next/navigation";

// /rivalries is consolidated into /match — rivalry context lives in the Matches hub
export default function RivalriesPage() {
  redirect("/match");
}
