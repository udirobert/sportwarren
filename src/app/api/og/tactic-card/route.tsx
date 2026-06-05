import { ImageResponse } from "next/og";
import { FORMATIONS, PLAY_STYLE_LABELS } from "@/lib/formations";
import { getTacticalPlanShare, getShareClaimsBySlug } from "@/server/services/tactical-plan-share";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "";
  const meParam = searchParams.get("me");

  const [record, claims] = await Promise.all([
    getTacticalPlanShare(slug),
    slug ? getShareClaimsBySlug(slug) : Promise.resolve([]),
  ]);

  const plan = record?.plan ?? {
    formation: "1-2-1" as const,
    style: "balanced" as const,
    size: 5 as const,
    color: "#10b981",
    names: [],
    source: "playground" as const,
  };

  const slots = FORMATIONS[plan.formation] || FORMATIONS["1-2-1"];
  const styleLabel = PLAY_STYLE_LABELS[plan.style]?.name ?? "Balanced";
  const color = plan.color || "#10b981";

  // Build a map of claimed names by position
  const claimMap = new Map(claims.map((c) => [c.positionIndex, c.displayName]));

  // Which slot is highlighted (from ?me= param)
  const meIndex =
    meParam !== null && /^\d+$/.test(meParam) && Number(meParam) < slots.length
      ? Number(meParam)
      : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#101816",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 480,
            height: 560,
            margin: 35,
            borderRadius: 26,
            border: "3px solid rgba(255,255,255,0.24)",
            background: "linear-gradient(180deg,#197047,#105a34)",
            position: "relative",
            display: "flex",
          }}
        >
          <div style={{ display: "flex", position: "absolute", inset: 18, border: "2px solid rgba(255,255,255,0.28)", borderRadius: 16 }} />
          <div style={{ display: "flex", position: "absolute", left: 18, right: 18, top: 280, height: 2, background: "rgba(255,255,255,0.28)" }} />
          <div style={{ display: "flex", position: "absolute", left: 190, top: 230, width: 100, height: 100, borderRadius: 50, border: "2px solid rgba(255,255,255,0.28)" }} />
          <div style={{ display: "flex", position: "absolute", left: 155, top: 18, width: 170, height: 82, borderLeft: "2px solid rgba(255,255,255,0.28)", borderRight: "2px solid rgba(255,255,255,0.28)", borderBottom: "2px solid rgba(255,255,255,0.28)", borderBottomLeftRadius: 14, borderBottomRightRadius: 14 }} />
          <div style={{ display: "flex", position: "absolute", left: 155, bottom: 18, width: 170, height: 82, borderLeft: "2px solid rgba(255,255,255,0.28)", borderRight: "2px solid rgba(255,255,255,0.28)", borderTop: "2px solid rgba(255,255,255,0.28)", borderTopLeftRadius: 14, borderTopRightRadius: 14 }} />

          {slots.map((slot, index) => {
            const isMe = meIndex === index;
            const claimedName = claimMap.get(index);
            const name = claimedName ?? plan.names[index] ?? slot.role;
            const bgColor = isMe ? "#f59e0b" : claimedName ? "#475569" : color;
            const borderOpacity = isMe ? 0.95 : claimedName ? 0.5 : 0.74;

            return (
              <div
                key={`${slot.role}-${index}`}
                style={{
                  position: "absolute",
                  left: `${slot.y}%`,
                  top: `${100 - slot.x}%`,
                  transform: "translate(-50%, -50%)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: isMe ? 58 : 50,
                    height: isMe ? 58 : 50,
                    borderRadius: isMe ? 29 : 25,
                    background: bgColor,
                    border: `${isMe ? 5 : 4}px solid rgba(255,255,255,${borderOpacity})`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: isMe ? 14 : 13,
                    fontWeight: 950,
                    boxShadow: isMe ? "0 0 0 4px rgba(245,158,11,0.35), 0 14px 30px rgba(0,0,0,0.25)" : "0 14px 30px rgba(0,0,0,0.25)",
                  }}
                >
                  {slot.role}
                </div>
                <div
                  style={{
                    marginTop: 5,
                    maxWidth: 84,
                    padding: "3px 6px",
                    borderRadius: 7,
                    background: isMe ? "rgba(245,158,11,0.25)" : "rgba(0,0,0,0.36)",
                    display: "flex",
                    justifyContent: "center",
                    fontSize: isMe ? 12 : 11,
                    fontWeight: isMe ? 950 : 850,
                    textAlign: "center",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", paddingRight: 54 }}>
          <div style={{ display: "flex", fontSize: 24, letterSpacing: 5, fontWeight: 950, color: "#6ee7b7", textTransform: "uppercase" }}>
            {meIndex !== null ? "My SportWarren spot" : "SportWarren setup"}
          </div>
          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", fontSize: 82, lineHeight: 0.95, fontWeight: 950, letterSpacing: 0 }}>
            <span>{plan.size}v{plan.size}</span>
            <span>/ {plan.formation}</span>
          </div>
          <div style={{ marginTop: 28, display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ display: "flex", padding: "11px 16px", borderRadius: 12, background: "rgba(255,255,255,0.09)", fontSize: 24, fontWeight: 900 }}>
              {styleLabel}
            </div>
            {meIndex !== null ? (
              <div style={{ display: "flex", padding: "11px 16px", borderRadius: 12, background: "rgba(245,158,11,0.18)", border: "2px solid rgba(245,158,11,0.4)", fontSize: 24, fontWeight: 950, color: "#fcd34d" }}>
                {slots[meIndex]?.role ?? "Player"} confirmed
              </div>
            ) : (
              <div style={{ display: "flex", padding: "11px 16px", borderRadius: 12, background: "rgba(255,255,255,0.09)", fontSize: 24, fontWeight: 900 }}>
                {claims.length}/{slots.length} claimed
              </div>
            )}
          </div>
          <div style={{ display: "flex", marginTop: 36, fontSize: 28, lineHeight: 1.25, color: "rgba(255,255,255,0.74)", maxWidth: 560 }}>
            {meIndex !== null
              ? `Playing ${slots[meIndex]?.role ?? "this position"}. Save the shape, then bring the result back after the game.`
              : "Save the shape, claim your role, then bring the result back after the game."}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
