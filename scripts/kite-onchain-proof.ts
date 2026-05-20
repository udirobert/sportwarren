#!/usr/bin/env tsx
/**
 * Judge/demo: execute a real Kite Passport x402 payment against a Kite-listed service.
 *
 *   pnpm exec tsx scripts/kite-onchain-proof.ts
 *
 * Requires: kpass logged in, registered agent, active session, funded wallet.
 * Optional: KITE_DEMO_SERVICE_URL (default: Kite Weather API on x402.dev.gokite.ai)
 */
import * as dotenv from 'dotenv';
import * as path from 'path';
import { executeKiteDemoPayment } from '../src/server/services/blockchain/x402-client.js';
import { isKitePassportConfigured } from '../src/server/services/blockchain/kite-passport.js';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('Kite on-chain proof (Passport → allowlisted x402 merchant)\n');

  const configured = await isKitePassportConfigured();
  console.log(`Passport configured: ${configured ? 'yes' : 'no'}`);
  if (!configured) {
    console.error('\nRun on the server (or locally): kpass login, kpass agent register, approve a session.');
    process.exit(1);
  }

  const result = await executeKiteDemoPayment();
  console.log(`Service: ${result.serviceUrl}`);
  if (result.error) console.log(`Error: ${result.error}`);
  if (result.explorerUrl) console.log(`KiteScan: ${result.explorerUrl}`);
  if (result.data) console.log(`Response: ${JSON.stringify(result.data).slice(0, 500)}`);

  if (!result.ok) {
    process.exit(1);
  }
  console.log('\nOK — payment succeeded. Share the KiteScan link with judges.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
