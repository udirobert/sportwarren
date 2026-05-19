import { generateAuthState } from './fixtures/auth';
import fs from 'fs';
import path from 'path';

export default async function globalSetup() {
  const baseUrl = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

  const auth = await generateAuthState(baseUrl);

  const storageState = {
    cookies: [],
    origins: [
      {
        origin: baseUrl,
        localStorage: [
          { name: 'sw_auth_signature', value: auth.signature },
          { name: 'sw_auth_message', value: auth.message },
          { name: 'sw_auth_timestamp', value: auth.timestamp },
          { name: 'sw_auth_address', value: auth.address },
          { name: 'sw_auth_chain', value: auth.chain },
        ],
      },
    ],
  };

  const outputPath = path.join(__dirname, 'auth-state.json');
  fs.writeFileSync(outputPath, JSON.stringify(storageState, null, 2));
}
