import * as dotenv from 'dotenv';
import { prisma } from '../src/lib/db';
import { yellowService } from '../server/services/blockchain/yellow';

dotenv.config();

async function main() {
  console.log('🚀 Seeding Yellow Demo Data...');

  // 1. Get or Create Demo Users
  let demoUser = await prisma.user.findFirst({ where: { walletAddress: '0xDEMO_USER_HACKNEY_MARSHES' } });
  if (!demoUser) {
    demoUser = await prisma.user.create({
      data: {
        walletAddress: '0xDEMO_USER_HACKNEY_MARSHES',
        chain: 'avalanche',
        name: 'Demo Captain',
      },
    });
  }

  // 2. Get or Create Demo Squads
  let homeSquad = await prisma.squad.findFirst({ where: { name: 'Northside United' } });
  if (!homeSquad) {
    homeSquad = await prisma.squad.create({
      data: {
        name: 'Northside United',
        shortName: 'NSU',
        region: 'London',
        bio: 'Premier amateur squad in North London.',
        logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=northside',
      },
    });
  }

  let awaySquad = await prisma.squad.findFirst({ where: { name: 'Chelsea Legends' } });
  if (!awaySquad) {
    awaySquad = await prisma.squad.create({
      data: {
        name: 'Chelsea Legends',
        shortName: 'CFC',
        region: 'London',
        bio: 'Former pros and local legends.',
        logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=chelsea',
      },
    });
  }

  // 3. Initialize Yellow Treasury Sessions
  const homeYellow = await yellowService.ensureTreasurySession(null, homeSquad.id);
  const awayYellow = await yellowService.ensureTreasurySession(null, awaySquad.id);

  await prisma.squadTreasury.upsert({
    where: { squadId: homeSquad.id },
    update: { yellowSessionId: homeYellow.sessionId },
    create: {
      squadId: homeSquad.id,
      balance: 500,
      yellowSessionId: homeYellow.sessionId,
    },
  });

  await prisma.squadTreasury.upsert({
    where: { squadId: awaySquad.id },
    update: { yellowSessionId: awayYellow.sessionId },
    create: {
      squadId: awaySquad.id,
      balance: 350,
      yellowSessionId: awayYellow.sessionId,
    },
  });

  console.log(`✅ Squad Treasuries linked to Yellow sessions: ${homeYellow.sessionId}, ${awayYellow.sessionId}`);

  // 4. Create a Match with an active Yellow Fee Session
  const matchFeeSession = await yellowService.createMatchFeeSession({
    matchId: 'demo-yellow-match',
    homeSquadId: homeSquad.id,
    awaySquadId: awaySquad.id,
    feeAmount: 1,
  });

  const match = await prisma.match.create({
    data: {
      homeSquadId: homeSquad.id,
      awaySquadId: awaySquad.id,
      homeScore: 3,
      awayScore: 1,
      matchDate: new Date(),
      submittedBy: demoUser.id,
      status: 'pending',
      yellowFeeSessionId: matchFeeSession.sessionId,
      verificationDetails: {
        workflowId: 'cre_demo_yellow_123',
        confidence: 100,
        verified: true,
        weather: {
          source: 'Open-Meteo',
          temperature: 18,
          conditions: 'Clear',
          verified: true,
        },
        location: {
          region: 'Stamford Bridge, London',
          placeType: 'stadium',
          isPitch: true,
          verified: true,
        },
      },
    },
  });

  console.log(`✅ Demo match created with Yellow Fee Session: ${match.id}`);
  console.log('✨ Yellow Demo Data Seeded Successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
