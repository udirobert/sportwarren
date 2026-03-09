# 🎬 SportWarren x Chainlink CRE - Demo Voiceover Script

**Duration:** 2:30 - 3:00 minutes  
**Format:** Screen recording with voiceover  
**Tone:** Professional, enthusiastic, clear

---

## 📋 Pre-Recording Checklist

- [ ] Run `npx tsx scripts/seed-demo-matches.ts` to populate test matches
- [ ] Start dev server: `npm run dev`
- [ ] Open browser to `http://localhost:3000/match`
- [ ] Have terminal ready for `npx tsx scripts/test-chainlink.ts`
- [ ] Set up screen recording (OBS/Loom/QuickTime)
- [ ] Close unnecessary browser tabs and notifications

---

## 🎬 Scene-by-Scene Script

### **SCENE 1: Opening (0:00 - 0:15)**

**Visual:** Match Center homepage with hero section

**Voiceover:**
> "Every weekend, thousands of amateur football matches are played without any official record. Captain disputes, unreliable stats, no proof of performance. This is the 'Phygital Trust Gap' — and it's what SportWarren solves with Chainlink CRE."

**Action:**
- Scroll down to show the navigation tabs
- Pause briefly on "Track Match" and "Verify" tabs

---

### **SCENE 2: Match Submission (0:15 - 0:35)**

**Visual:** Track Match tab with match capture form

**Voiceover:**
> "Let me show you how it works. After a match, the captain submits the result — in this case, Northside United defeated Chelsea Legends 3-1 at Stamford Bridge. The GPS coordinates are automatically captured from the venue."

**Action:**
- Show the pre-filled form with Stamford Bridge coordinates (51.4817, -0.1910)
- Click "Submit Match"
- Transition to match detail page as CRE workflow triggers

---

### **SCENE 3: CRE Workflow Animation (0:35 - 1:05)**

**Visual:** Technical Commentary panel with animated logs

**Voiceover:**
> "Here's where the magic happens. Chainlink CRE orchestrates a verification workflow in real-time. First, it fetches weather data from Open-Meteo — a sovereign, keyless oracle. Then it verifies the location using OpenStreetMap to confirm this is a legitimate football stadium."

**Action:**
- Let the logs animate naturally (don't rush)
- Point out (with cursor or highlight):
  - Weather source and temperature
  - Location verification as "stadium"
  - Trust score computing to 100/100

**Voiceover (continued):**
> "The weighted consensus algorithm computes a confidence score — 40% for weather, 60% for location. Stadium plus verified weather equals 100 out of 100 trust. This workflow ID — `cre_mw_...` — is permanently linked to the match record."

---

### **SCENE 4: CRE Data Deep Dive (1:05 - 1:30)**

**Visual:** Expand "CRE Verification Data" section

**Voiceover:**
> "Let's dive deeper into the verification data. You can see the exact temperature, weather conditions, and the data source. The location is confirmed as a stadium in London. All of this is verifiable, tamper-proof data fetched by Chainlink's decentralized oracle network."

**Action:**
- Click to expand "CRE Verification Data"
- Highlight the confidence score bar (100/100)
- Show the breakdown: Weather ✓ (40%), Location ✓ Stadium (60%)

---

### **SCENE 5: CRE Architecture Diagram (1:30 - 1:55)**

**Visual:** CRE Workflow Diagram component

**Voiceover:**
> "This diagram shows the full CRE architecture. On the left, the Weather Oracle fetches real-world data. On the right, the Location Oracle verifies the venue. Both feed into the CRE Consensus Engine, which computes the trust score. Finally, the result is settled on-chain with a unique workflow ID that can be audited anytime."

**Action:**
- Let the diagram animate (nodes appearing in sequence)
- Cursor-trace the flow: Oracles → Consensus → Settlement
- Pause on the "100 HIGH CONFIDENCE" badge

---

### **SCENE 6: Disputed Match Scenario (1:55 - 2:20)**

**Visual:** Navigate to a disputed match (Burgess Park - 70% confidence)

**Voiceover:**
> "Now let's look at a disputed match. This game was played at Burgess Park — a public park, not a registered stadium. The CRE workflow detected this, and the confidence score drops to 70%. The away captain disputed the result, and the system flags it for manual review. Chainlink's weighted consensus prevents fraud while allowing legitimate disputes."

**Action:**
- Click on the disputed match card
- Show the lower confidence score (70/100)
- Highlight "Place Type: PARK" vs "STADIUM"
- Show the dispute status badge

---

### **SCENE 7: Terminal Demo (2:20 - 2:40)**

**Visual:** Terminal running `npx tsx scripts/test-chainlink.ts`

**Voiceover:**
> "For developers, we provide a test script that demonstrates the CRE workflow in action. You can see the real-time data fetching from Open-Meteo and OpenStreetMap, with the confidence score computed on-chain. This same code runs in production — just add your API keys."

**Action:**
- Show terminal output with JSON result
- Highlight the workflow ID and verification sources
- Let the "✅ Real-world data used via CRE workflow" message show

---

### **SCENE 8: Closing & Call to Action (2:40 - 3:00)**

**Visual:** Back to Match Center homepage, then GitHub repo

**Voiceover:**
> "SportWarren + Chainlink CRE = Trustless amateur sports verification. Players earn XP only from verified matches. Their attributes improve based on real performance, secured on-chain. This is the future of amateur football — built for the Chainlink CRE Hackathon 2026."

**Action:**
- Show the XP summary screen briefly
- Navigate to GitHub repo page
- End screen with:
  - SportWarren logo
  - "Powered by Chainlink CRE"
  - GitHub URL: `github.com/udirobert/sportwarren`
  - Devpost submission link

---

## 🎤 Recording Tips

### **Audio Quality**
- Use a quiet room with minimal echo
- Speak clearly and at a moderate pace
- Consider using headphones with a built-in mic
- Record a 10-second test to check audio levels

### **Pacing**
- Don't rush — let animations complete naturally
- Pause for 1-2 seconds between scenes
- If you mess up a line, pause, then restart that sentence (edit later)

### **Visual Polish**
- Use cursor highlights or zoom effects for key elements
- Keep browser chrome visible (URL bar shows localhost)
- Use dark mode terminal for better contrast
- Set browser zoom to 100% or 110% for readability

---

## ✂️ Editing Notes

### **Suggested Cuts**
- Remove any dead air or long pauses
- Trim loading states (speed up 2x or cut entirely)
- Add smooth transitions between scenes

### **Overlays to Add**
- Title card at start: "SportWarren x Chainlink CRE Hackathon"
- Lower-third text for key terms: "CRE Workflow", "Confidence Score", "On-Chain Settlement"
- End card with links and contact info

### **Background Music**
- Use royalty-free tech/upbeat background music
- Keep volume low (10-15% under voiceover)
- Suggested: "Tech Corporate" or "Innovation" style tracks

---

## 📝 Alternative Short Version (60 seconds)

If you need a shorter demo for social media:

| Time | Content |
|------|---------|
| 0:00-0:10 | Problem: Amateur sports lack verification |
| 0:10-0:25 | Solution: Submit match → CRE verifies weather + location |
| 0:25-0:40 | Demo: Show CRE workflow animation + 100/100 score |
| 0:40-0:50 | Architecture: Quick diagram overview |
| 0:50-1:00 | CTA: GitHub link + hackathon submission |

---

## 🎯 Key Messages to Emphasize

1. **"Phygital Trust Gap"** - Real problem, clear framing
2. **"Sovereign fallbacks"** - Open-Meteo + OSM (no API keys required)
3. **"Weighted consensus"** - Not binary, but confidence scoring
4. **"Workflow ID traceability"** - Auditable, verifiable on-chain
5. **"Real use case"** - Amateur footballers need this today

---

## 🔗 Links for Description

```
🏆 SportWarren - Championship Manager Meets Web3
🔗 Chainlink CRE Hackathon 2026 Submission

GitHub: https://github.com/udirobert/sportwarren
Devpost: [Your Devpost submission link]
Demo: https://sportwarren.vercel.app

Tech Stack:
- Chainlink CRE (Runtime Environment)
- Open-Meteo (Sovereign Weather Oracle)
- OpenStreetMap (Decentralized Location)
- Algorand (On-Chain Settlement)
- Next.js + tRPC + PostgreSQL

Built with ❤️ for footballers everywhere.
```

---

Good luck with your hackathon submission! 🚀⚽
