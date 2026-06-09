# 🎬 SportWarren x Yellow: The Autonomous Amateur Sports Economy

**Goal:** Show how Yellow Network provides the economic engine for phygital amateur sports.

---

## **Scene 1: Squad Treasury (0:00 - 0:40)**
**Visual:** Squad Treasury page (`/squad/treasury`)

**Voiceover:**
> "Amateur sports has a liquidity problem—chasing player fees and paying for facilities is a manual nightmare. SportWarren solves this with Yellow-backed Squad Treasuries. This squad's treasury isn't just a database entry; it's a real-time settlement session on the Yellow Network."

**Action:**
- Point out the "Yellow Live Rail" badge on the Treasury card.
- Click "Deposit Funds", enter 10, and confirm.
- "When I deposit funds, the Yellow session updates instantly. This provides the squad with verified liquidity for transfers and match fees."

---

## **Scene 2: Transfer Market (0:40 - 1:10)**
**Visual:** Transfer Market page (`/squad/transfers`)

**Voiceover:**
> "The transfer market uses Yellow Escrow to protect both squads. When a transfer is initiated, funds are locked in a shared Yellow session. This ensures that the selling squad is paid as soon as the player joins, with no middle-man or escrow delay."

**Action:**
- Click on an active transfer offer.
- Point to the "Escrow Active" status and the Yellow Session ID.
- "This multi-sig session between squad leaders makes the amateur transfer market as professional as the Premier League."

---

## **Scene 3: Match Settlement (1:10 - 1:50)**
**Visual:** Match Consensus page (`/match/[id]`)

**Voiceover:**
> "The real magic happens on match day. When a result is submitted, Yellow locks match fees from both squads. Here, we see Chainlink CRE verifying the weather and location. As soon as the trust score hits 100% and consensus is reached..."

**Action:**
- Scroll down to the Technical Commentary logs.
- Point out the "YELLOW: Match fee session active" log.
- Click "Verify" to reach 100% consensus.
- "Notice the logs: Yellow automatically executes the payout. The winner's stake is returned to their treasury, and a platform fee is settled. Physical verification via CRE triggers economic settlement via Yellow—automatically."

---

## **Closing (1:50 - 2:00)**
**Visual:** Homepage with the phygital roadmap.

**Voiceover:**
> "SportWarren isn't just a tracker; it's the infrastructure for the $100B amateur sports market. By combining Chainlink CRE for verification and Yellow Network for autonomous settlement, we're building a thriving, transparent, and professional amateur sports ecosystem."

---

## 📋 Pre-Demo Setup

1. **Seed Data:** `npx tsx scripts/seed-yellow-demo.ts`
2. **Environment:** Ensure `NEXT_PUBLIC_YELLOW_ENABLED=true` in `.env`
3. **Wallet:** Connect an EVM wallet (Avalanche or Lens) in the app.
4. **Flow:** 
   - Start at `/squad/treasury`
   - Move to `/match` to find the demo match (3-1 vs Chelsea Legends).
