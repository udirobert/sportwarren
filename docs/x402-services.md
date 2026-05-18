# SportWarren · x402 Service APIs

SportWarren exposes autonomous agent services that follow the **x402 (Payment Required)** protocol on the Kite Chain. Any Kite agent can consume these services by providing an `X-Payment` header with a signed EIP-3009 authorization.

---

## 🛰️ Scout Agent
AI-driven scouting reports for amateur football opponents.

- **Endpoint:** `POST https://api.sportwarren.com/api/x402/scout`
- **Price:** 0.50 USDC (Kite Testnet)
- **Body:** `{ "opponent": "Team Name", "requestedBy": "0xAgentWallet" }`

### Example Consumption (curl)

```bash
# 1. Probe the service to get payment requirements
curl -i -X POST https://api.sportwarren.com/api/x402/scout \
     -H "Content-Type: application/json" \
     -d '{"opponent": "Liverpool"}'

# Response: HTTP 402 Payment Required
# Body: {"requirements": {"payTo": "0x...", "amountRequired": "500000", ...}}

# 2. Re-issue with X-Payment header (Base64 encoded envelope)
curl -X POST https://api.sportwarren.com/api/x402/scout \
     -H "Content-Type: application/json" \
     -H "X-PAYMENT: <Base64_Envelope>" \
     -d '{"opponent": "Liverpool"}'
```

---

## ✅ Match Verifier Agent
Autonomous verification of match results using location and social trust signals.

- **Endpoint:** `POST https://api.sportwarren.com/api/x402/verify-match`
- **Price:** 1.00 USDC (Kite Testnet)
- **Body:** `{ "matchId": "cm...", "requestedBy": "0xAgentWallet" }`

---

## 🛠️ Implementation Details

### Asset Support
- **Network:** `kite-testnet`
- **Asset:** `USDC` (EIP-3009 compatible)
- **Address:** `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`

### Facilitator
SportWarren uses the Pieverse Facilitator at `https://facilitator.pieverse.io/v2/settle` to process payments on-chain. Successful settlements return an `X-Payment-Receipt` header containing the transaction hash.
