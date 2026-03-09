import { redirect } from "next/navigation";

// /challenges is consolidated into /squad — challenge setup lives in the Squad hub
export default function ChallengesPage() {
  redirect("/squad");
}
