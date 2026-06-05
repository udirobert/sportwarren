import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Shield, Sparkles, UserRound, Users } from "lucide-react";
import { FORMATIONS, PLAY_STYLE_LABELS, ROLE_LABELS } from "@/lib/formations";
import { buildTacticalPlanQuery } from "@/lib/pitch/tacticalPlan";
import {
  getTacticalPlanShare,
  getTacticalPlanTitle,
  getShareClaimsBySlug,
} from "@/server/services/tactical-plan-share";
import { TacticShareActions } from "@/components/play/TacticShareActions";
import { ClaimablePitch } from "@/components/play/ClaimablePitch";

type PlaySharePageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ me?: string; remix?: string }>;
};

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function getShareCopy(planTitle: string, names: string[]): string {
  const named = names.filter(Boolean);
  if (named.length >= 3) {
    return `Tonight's SportWarren setup: ${planTitle}. ${named.slice(0, 3).join(", ")} are in. Claim your spot.`;
  }
  return `Tonight's SportWarren setup: ${planTitle}. Claim your spot.`;
}

export async function generateMetadata({ params, searchParams }: PlaySharePageProps): Promise<Metadata> {
  const { slug } = await params;
  const { me: meParam } = await searchParams;
  const record = await getTacticalPlanShare(slug);

  if (!record) {
    return {
      title: "Shared tactic not found | SportWarren",
      description: "This SportWarren tactical setup is no longer available.",
    };
  }

  const slots = FORMATIONS[record.plan.formation] || [];
  // Validate me param before including it in URLs
  const meIndex =
    meParam !== undefined && /^\d+$/.test(meParam) && Number(meParam) < slots.length
      ? Number(meParam)
      : null;

  const title = meIndex !== null
    ? `My ${slots[meIndex]?.role ?? "spot"} — ${getTacticalPlanTitle(record.plan)} | SportWarren`
    : `${getTacticalPlanTitle(record.plan)} | SportWarren`;
  const description = getShareCopy(getTacticalPlanTitle(record.plan), record.plan.names);
  const baseUrl = getBaseUrl();

  // Wire ?me= into the OG image so personalised links get personalised previews
  const imageUrl = meIndex !== null
    ? `${baseUrl}/api/og/tactic-card?slug=${encodeURIComponent(slug)}&me=${meIndex}`
    : `${baseUrl}/api/og/tactic-card?slug=${encodeURIComponent(slug)}`;

  const pageUrl = meIndex !== null
    ? `${baseUrl}/play/${encodeURIComponent(slug)}?me=${meIndex}`
    : `${baseUrl}/play/${encodeURIComponent(slug)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      url: pageUrl,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PlaySharePage({ params, searchParams }: PlaySharePageProps) {
  const { slug } = await params;
  const { me: meParam, remix: remixParam } = await searchParams;

  const [record, initialClaims] = await Promise.all([
    getTacticalPlanShare(slug, { incrementView: true }),
    getShareClaimsBySlug(slug),
  ]);

  if (!record) notFound();

  const { plan } = record;
  const planQuery = buildTacticalPlanQuery(plan);
  const saveHref = `/squad?tab=tactics&new=1&share=${encodeURIComponent(slug)}&${planQuery}`;
  const matchHref = `/match?mode=capture&share=${encodeURIComponent(slug)}&${planQuery}`;
  const baseUrl = getBaseUrl();
  const shareUrl = `${baseUrl}/play/${encodeURIComponent(slug)}`;
  const styleLabel = PLAY_STYLE_LABELS[plan.style];
  const planTitle = getTacticalPlanTitle(plan);
  const shareText = getShareCopy(planTitle, plan.names);
  const slots = FORMATIONS[plan.formation] || [];

  // Parse ?me= — must be a valid slot index
  const meIndex =
    meParam !== undefined && /^\d+$/.test(meParam) && Number(meParam) < slots.length
      ? Number(meParam)
      : null;
  const selectedRole = meIndex !== null ? slots[meIndex]?.role : null;
  const selectedRoleLabel = selectedRole ? ROLE_LABELS[selectedRole] ?? selectedRole : "your spot";
  const remixSlug = typeof remixParam === "string" && /^[a-zA-Z0-9_-]{6,64}$/.test(remixParam)
    ? remixParam
    : null;

  return (
    <main className="min-h-screen bg-[#f7faf7] text-slate-950">
      <section className="border-b border-emerald-900/10 bg-[#101816] text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:py-10">
          <div>
            <Link href="/" className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">
              SportWarren
            </Link>
            <h1 className="mt-5 max-w-3xl text-4xl font-black leading-tight tracking-normal md:text-6xl">
              {meIndex !== null
                ? `Claim ${selectedRoleLabel}`
                : "Claim your spot. Build your player card."}
            </h1>
            <p className="mt-4 max-w-2xl text-base font-medium leading-7 text-emerald-50/80">
              {plan.size}v{plan.size} {styleLabel.name.toLowerCase()} setup. Tap a position to put yourself in the shape, then share the card back to the group.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80">Views</p>
              <p className="mt-1 text-sm font-bold text-white">{record.viewCount.toLocaleString()}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-300/80">Claimed</p>
              <p className="mt-1 text-sm font-bold text-white">{initialClaims.length}/{slots.length}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1fr_0.82fr] lg:py-8">
        {/* Interactive pitch */}
        <div className="rounded-lg border border-emerald-900/10 bg-[#144c34] p-3 shadow-xl shadow-emerald-950/10">
          <ClaimablePitch
            slug={slug}
            slots={slots}
            names={plan.names}
            color={plan.color || "#10b981"}
            meIndex={meIndex}
            initialClaims={initialClaims}
            formation={plan.formation}
            remixSlug={remixSlug}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Matchday sheet</p>
            <h2 className="mt-3 text-2xl font-black text-slate-950">{styleLabel.name}</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{styleLabel.description}</p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <Users className="h-4 w-4 text-emerald-700" />
                <p className="mt-2 text-xs font-black uppercase text-slate-500">Format</p>
                <p className="text-sm font-bold text-slate-900">{plan.size} a side</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <Shield className="h-4 w-4 text-emerald-700" />
                <p className="mt-2 text-xs font-black uppercase text-slate-500">Shape</p>
                <p className="text-sm font-bold text-slate-900">{plan.formation}</p>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <ClipboardList className="h-4 w-4 text-emerald-700" />
                <p className="mt-2 text-xs font-black uppercase text-slate-500">Players</p>
                <p className="text-sm font-bold text-slate-900">{plan.names.length || plan.size} listed</p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-lg border border-slate-900 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-400/15 text-emerald-300">
                <UserRound className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">Player-first loop</p>
                <h2 className="mt-2 text-xl font-black text-white">The tactic gets stronger as real players claim it.</h2>
              </div>
            </div>
            <div className="mt-5 grid gap-3">
              {[
                "Claimed spots become starter player cards.",
                "Saved profiles can replace placeholders with avatars and verified stats.",
                "Every share gives the next teammate a native role to step into.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-md border border-white/10 bg-white/[0.04] p-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-300" />
                  <p className="text-sm font-medium leading-5 text-slate-200">{item}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Next action</p>
            <h2 className="mt-3 text-xl font-black text-slate-950">Turn this group-chat plan into player profiles and a team record.</h2>
            <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
              Small-sided squads usually start with one setup, one result, and one shared link. SportWarren keeps the plan, the player card, and the match record together.
            </p>
            <div className="mt-5">
              <TacticShareActions
                slug={slug}
                shareUrl={shareUrl}
                shareText={shareText}
                saveHref={saveHref}
                matchHref={matchHref}
                formation={plan.formation}
                style={plan.style}
                size={plan.size}
              />
            </div>
          </div>

          <Link
            href={`/?${planQuery}`}
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 transition hover:text-emerald-600"
          >
            Remix this setup in the playground
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </section>
    </main>
  );
}
