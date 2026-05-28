import { ImageResponse } from "next/og";

export const runtime = "edge";

/**
 * Generates a formation card image (1200x630 PNG) for social sharing.
 * GET /api/og/formation?f=4-3-3&style=counter&color=%2310b981&names=Salah,Kane,Saka
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const formation = searchParams.get("f") || "4-4-2";
  const style = searchParams.get("style") || "balanced";
  const color = searchParams.get("color") || "#10b981";
  const namesRaw = searchParams.get("names") || "";

  // Parse formation positions from the string (e.g. "4-3-3" → count players)
  const parts = formation.split("-").map(Number).filter((n) => !isNaN(n) && n > 0);
  const outfieldCount = parts.reduce((a, b) => a + b, 0);
  const totalPlayers = outfieldCount + 1; // +1 for GK

  const names = namesRaw
    .split(",")
    .map((n) => decodeURIComponent(n.trim()))
    .filter(Boolean)
    .slice(0, totalPlayers);

  // Generate simple dot positions in rows based on formation parts
  const rows: { x: number; y: number }[] = [];
  // GK
  rows.push({ x: 300, y: 430 });
  // Outfield rows from back to front
  const rowSpacing = 340 / (parts.length + 1);
  parts.forEach((count, rowIdx) => {
    const y = 410 - rowSpacing * (rowIdx + 1);
    const colSpacing = 480 / (count + 1);
    for (let i = 0; i < count; i++) {
      rows.push({ x: 60 + colSpacing * (i + 1), y });
    }
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#0b1322",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Pitch area */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Pitch background */}
          <div
            style={{
              width: 600,
              height: 480,
              backgroundColor: "#15803d",
              borderRadius: 16,
              border: "2px solid rgba(255,255,255,0.2)",
              position: "relative",
              display: "flex",
            }}
          >
            {/* Center line */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 40,
                right: 40,
                height: 2,
                backgroundColor: "rgba(255,255,255,0.25)",
              }}
            />
            {/* Center circle */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: 80,
                height: 80,
                borderRadius: 40,
                border: "2px solid rgba(255,255,255,0.25)",
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Player dots */}
            {rows.slice(0, totalPlayers).map((pos, i) => (
              <div
                key={i}
                style={{
                  position: "absolute",
                  left: pos.x - 16,
                  top: pos.y - 16,
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: color,
                  border: "3px solid rgba(255,255,255,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {names[i] ? names[i].charAt(0).toUpperCase() : String(i + 1)}
              </div>
            ))}
            {/* Player names below dots */}
            {names.slice(0, totalPlayers).map((name, i) => {
              const pos = rows[i];
              if (!pos || name.length <= 2) return null;
              return (
                <div
                  key={`name-${i}`}
                  style={{
                    position: "absolute",
                    left: pos.x - 30,
                    top: pos.y + 18,
                    width: 60,
                    textAlign: "center",
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#fff",
                    textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                  }}
                >
                  {name}
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 32px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: 2,
                color: "#4ade80",
                textTransform: "uppercase",
              }}
            >
              SportWarren
            </span>
            <span style={{ fontSize: 12, color: "#6b7280" }}>|</span>
            <span style={{ fontSize: 16, fontFamily: "monospace", fontWeight: 800, color: "#fff" }}>
              {formation}
            </span>
            <span style={{ fontSize: 12, color: "#9ca3af", textTransform: "capitalize" }}>
              {style.replace("_", " ")}
            </span>
          </div>
          <span style={{ fontSize: 12, color: "rgba(74,222,128,0.7)", fontWeight: 700 }}>
            sportwarren.com/play
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
