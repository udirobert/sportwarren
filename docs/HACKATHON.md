# 🔗 SportWarren x Chainlink CRE Hackathon Demo

**Generalizable CRE Pattern for Phygital Verification** | Sports is Just the Demo

---

## 🎯 The Real Product: Reusable CRE Architecture

**SportWarren demonstrates a generalizable Chainlink CRE pattern for multi-source real-world verification.** While we use amateur football as our demo use case, the weighted consensus engine (multi-oracle data → confidence scoring → on-chain settlement) applies to:

| Use Case | Oracle A | Oracle B | Consensus Logic |
|----------|----------|----------|-----------------|
| **Sports (Our Demo)** | Weather | Location (stadium) | Verify match occurred |
| **Insurance Claims** | Weather data | Property records | Auto-payout if both confirm damage |
| **Pharma Supply Chain** | Temperature | GPS location | Invalidate shipment if temp exceeded |
| **Event Verification** | Identity (WorldID) | Attendance scan | Verify unique human presence |
| **Disaster Relief** | Satellite imagery | Ground sensors | Allocate aid by damage confidence |
| **Real Estate** | Property registry | IoT sensors | Trigger insurance on verified events |

**The architecture is the product. Sports is just our demo.**

---

## 🚀 Quick Start - Hackathon Demo

### 1. **Seed Demo Data** (Recommended)

Populate the database with pre-configured test matches showcasing different CRE verification outcomes:

```bash
npx tsx scripts/seed-demo-matches.ts
```

This creates:
- ✅ **Stamford Bridge** match - 100% confidence (stadium verification)
- ⚠️ **Burgess Park** match - 70% confidence (park, not stadium)
- ✅ **Wembley Stadium** match - 100% confidence (iconic venue)

### 2. **Start Development Server**

```bash
npm run dev
```

Navigate to: **http://localhost:3000/match**

### 3. **Terminal Demo** (Optional)

Show the CRE workflow in action via terminal:

```bash
npx tsx scripts/demo-cre-workflow.ts
```

This displays colorful, animated CRE workflow execution with:
- Oracle calls (weather + location)
- Consensus computation
- On-chain settlement visualization

---

## 🎬 Demo Recording Guide

### **Scene 1: Problem Statement** (0:00-0:20)
- Show Match Center homepage
- Explain the "Phygital Trust Gap" in amateur sports

### **Scene 2: Match Submission** (0:20-0:40)
- Submit a match with GPS coordinates (Stamford Bridge)
- Show the form with auto-captured location data

### **Scene 3: CRE Workflow Animation** (0:40-1:10)
- Watch the Technical Commentary panel animate
- Highlight: Weather oracle → Location oracle → Consensus → Settlement
- Point out the workflow ID: `cre_mw_...`

### **Scene 4: Data Deep Dive** (1:10-1:40)
- Expand "CRE Verification Data" section
- Show weather conditions, location type, confidence score
- Explain weighted consensus (40% weather + 60% location)

### **Scene 5: Architecture Diagram** (1:40-2:00)
- Scroll to CRE Workflow Diagram
- Trace the flow: Oracles → Consensus Engine → On-Chain Settlement
- Highlight the "100 HIGH CONFIDENCE" badge

### **Scene 6: Disputed Match** (2:00-2:20)
- Navigate to Burgess Park match (70% confidence)
- Show how partial verification triggers dispute flow
- Explain fraud prevention via weighted consensus

### **Scene 7: Terminal Demo** (2:20-2:40)
- Run `npx tsx scripts/demo-cre-workflow.ts`
- Show real oracle data fetching
- Highlight workflow ID and verification sources

### **Scene 8: Closing** (2:40-3:00)
- Show XP summary screen
- Navigate to GitHub repo
- End card with links

---

## 📁 Key Files for Hackathon Submission

### **CRE Workflow Implementation**
- `server/services/blockchain/cre/match-verification.ts` - Core CRE workflow logic
- `server/services/blockchain/chainlink.ts` - Chainlink service integration

### **Frontend Components**
- `src/components/match/MatchConsensus.tsx` - Enhanced with CRE data display
- `src/components/match/CREWorkflowDiagram.tsx` - Visual architecture diagram
- `src/app/match/page.tsx` - Main match center page

### **Demo Scripts**
- `scripts/seed-demo-matches.ts` - Populate test matches
- `scripts/demo-cre-workflow.ts` - Terminal demo with colors
- `scripts/test-chainlink.ts` - Basic Chainlink integration test

### **Documentation**
- `scripts/DEMO_VOICEOVER.md` - Full voiceover script for recording
- `HACKATHON.md` - This file

---

## 🔧 Configuration

### **Environment Variables** (Optional)

For production oracle data (optional - demo works without):

```bash
# .env.local
OPENWEATHER_API_KEY=your_key_here      # For weather data
GEO_VERIFICATION_API_KEY=your_key_here # For Google Maps/LocationIQ
CRE_SIMULATION=false                   # Set to false for real API calls
```

### **Sovereign Fallbacks**

The demo works **without API keys** using:
- **Open-Meteo** - Sovereign weather oracle (no key required)
- **OpenStreetMap Nominatim** - Decentralized location verification (no key required)

---

## 🏆 Hackathon Value Proposition

### **Problem: The Phygital Trust Gap**
Amateur sports lack immutable, trustless records. Matches are disputed, stats are centralized, and performance data is easy to manipulate.

### **Solution: Sovereign Phygital Engine**
SportWarren uses Chainlink CRE to verify real-world matches with:
- **Parallel Oracle Actions** - Weather + Location fetched simultaneously
- **Weighted Consensus** - 40% weather + 60% location = confidence score
- **On-Chain Settlement** - Workflow ID permanently linked to match record
- **Sovereign Fallbacks** - Open-Meteo + OSM for keyless operation

### **Why Chainlink CRE?**
- **Single Workflow** - Orchestrates multiple data sources in one call
- **Traceability** - Unique `workflowId` for auditability
- **Flexibility** - Custom consensus logic (weighted scoring)
- **Sovereignty** - Works with keyless, decentralized APIs

---

## 📊 Demo Match Scenarios

| Scenario | Location | Coordinates | Expected Confidence | Notes |
|----------|----------|-------------|---------------------|-------|
| Stamford Bridge | Stadium | 51.4817, -0.1910 | 100% | Perfect verification |
| Burgess Park | Public Park | 51.4756, -0.0889 | 70% | Partial (not stadium) |
| Wembley Stadium | National Stadium | 51.5560, -0.2795 | 100% | Iconic venue |
| Old Trafford | Stadium | 53.4631, -2.2913 | 100% | Weather challenge |
| Random Field | Open Field | 51.5074, -0.1278 | 40% | Low confidence |

---

## 🎯 Submission Checklist

- [ ] **Demo Video** (2-3 min) recorded and uploaded
- [ ] **GitHub Repo** with CRE code highlighted in README
- [ ] **Live Demo** deployed (Vercel/Netlify)
- [ ] **Devpost Submission** with problem/solution clearly stated
- [ ] **Test Scripts** working (`seed-demo-matches.ts`, `demo-cre-workflow.ts`)
- [ ] **Architecture Diagram** visible in UI

---

## 🔗 Links for Submission

```
🏆 Project Name: SportWarren - Phygital Match Verification
🔗 Hackathon: Chainlink CRE Hackathon 2026
📍 GitHub: https://github.com/udirobert/sportwarren
🎬 Demo Video: [Your YouTube/Loom link]
🚀 Live Demo: [Your Vercel/Netlify link]
📝 Devpost: [Your Devpost submission link]
```

---

## 💡 Tips for Judges

When reviewing this submission, look for:

1. **CRE Usage** - Check `server/services/blockchain/cre/match-verification.ts`
2. **Real-World Data** - Open-Meteo + OpenStreetMap integration
3. **Consensus Logic** - Weighted scoring (40/60) in `execute()` method
4. **Workflow Traceability** - `workflowId` persisted in PostgreSQL
5. **UI/UX** - CRE Workflow Diagram + Technical Commentary panel

---

## 🤝 Contributing / Questions

For hackathon-related questions:
- Open an issue on GitHub
- Contact: [Your contact info]

**Built with ❤️ for the Chainlink CRE Hackathon 2026**

⚽ **SportWarren** | 🔗 **Powered by Chainlink CRE**
