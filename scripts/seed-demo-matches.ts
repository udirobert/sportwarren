/**
 * DEMO MATCH SEED SCRIPT
 * 
 * Creates pre-configured test matches for Chainlink CRE Hackathon demo.
 * Each match demonstrates different CRE verification outcomes.
 * 
 * Usage: npx tsx scripts/seed-demo-matches.ts
 */

import * as dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { matchVerificationWorkflow } from '../server/services/blockchain/cre/match-verification';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

// Create database pool with PrismaPg adapter (Prisma 7 pattern)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'] as const,
});

// Demo match configurations
const DEMO_MATCHES = [
  {
    name: '🏆 PERFECT VERIFICATION - Stamford Bridge',
    homeTeam: 'Northside United',
    awayTeam: 'Chelsea Legends',
    homeScore: 3,
    awayScore: 1,
    // Stamford Bridge coordinates (actual stadium)
    latitude: 51.4817,
    longitude: -0.1910,
    description: 'Stadium venue + verified weather = 100% confidence',
  },
  {
    name: '⚠️ PARTIAL VERIFICATION - Burgess Park',
    homeTeam: 'Sunday Legends',
    awayTeam: 'Red Lions FC',
    homeScore: 2,
    awayScore: 2,
    // Burgess Park (public park, not registered stadium)
    latitude: 51.4756,
    longitude: -0.0889,
    description: 'Park venue (not stadium) = 70% confidence',
  },
  {
    name: '❌ LOW CONFIDENCE - Random Field',
    homeTeam: 'Park Rangers',
    awayTeam: 'Athletic FC',
    homeScore: 1,
    awayScore: 4,
    // Random coordinates in open field
    latitude: 51.5074,
    longitude: -0.1278,
    description: 'Unverified location = 40% confidence',
  },
  {
    name: '✅ NIGHT MATCH - Wembley',
    homeTeam: 'London All-Stars',
    awayTeam: 'Manchester Elite',
    homeScore: 2,
    awayScore: 3,
    // Wembley Stadium
    latitude: 51.5560,
    longitude: -0.2795,
    description: 'Iconic venue verification',
  },
  {
    name: '🌧️ WEATHER CHALLENGE - Old Trafford',
    homeTeam: 'United Veterans',
    awayTeam: 'City Pros',
    homeScore: 1,
    awayScore: 1,
    // Old Trafford
    latitude: 53.4631,
    longitude: -2.2913,
    description: 'Weather verification in challenging conditions',
  },
];

async function createDemoUser() {
  console.log('📝 Creating demo user...');
  
  let user = await prisma.user.findUnique({
    where: { walletAddress: '0xDEMO_HACKATHON_USER' }
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        walletAddress: '0xDEMO_HACKATHON_USER',
        chain: 'algorand',
        name: 'Demo Captain',
      }
    });
    console.log('✅ Demo user created:', user.id);
  } else {
    console.log('✅ Demo user exists:', user.id);
  }

  return user;
}

async function createDemoSquads() {
  console.log('\n🏟️ Creating demo squads...');
  
  const squadNames = [
    'Northside United',
    'Chelsea Legends',
    'Sunday Legends',
    'Red Lions FC',
    'Park Rangers',
    'Athletic FC',
    'London All-Stars',
    'Manchester Elite',
    'United Veterans',
    'City Pros',
  ];

  const squads: Record<string, any> = {};

  for (const name of squadNames) {
    // Check if squad exists by querying with a filter
    const existingSquads = await prisma.squad.findMany({
      where: { name },
      take: 1
    });

    let squad = existingSquads[0];

    if (!squad) {
      // Generate short name from full name
      const shortName = name.split(' ').slice(0, 2).join(' ').toUpperCase();
      
      squad = await prisma.squad.create({
        data: {
          name,
          shortName,
        }
      });
      console.log(`  ✅ Squad created: ${name}`);
    } else {
      console.log(`  ✅ Squad exists: ${name}`);
    }

    squads[name] = squad;
  }

  return squads;
}

async function runCREWorkflow(matchData: typeof DEMO_MATCHES[0]) {
  console.log(`\n🔗 Running CRE workflow for: ${matchData.name}`);
  
  try {
    const result = await matchVerificationWorkflow.execute({
      latitude: matchData.latitude,
      longitude: matchData.longitude,
      timestamp: Math.floor(Date.now() / 1000),
      homeTeam: matchData.homeTeam,
      awayTeam: matchData.awayTeam,
    });

    console.log(`   Confidence: ${result.confidence}/100`);
    console.log(`   Verified: ${result.verified}`);
    console.log(`   Weather: ${result.weather.temperature}°C, ${result.weather.conditions} (${result.weather.source})`);
    console.log(`   Location: ${result.location.region} (${result.location.placeType})`);
    console.log(`   Workflow ID: ${result.workflowId}`);

    return result;
  } catch (error) {
    console.error('   ❌ CRE workflow failed:', error instanceof Error ? error.message : error);
    return null;
  }
}

async function seedDemoMatches() {
  console.log('⚽ SportWarren - Chainlink CRE Hackathon Demo Seeder\n');
  console.log('=' .repeat(60));

  try {
    // Optional: Clear existing demo matches for clean re-run
    console.log('🧹 Cleaning up existing demo matches...\n');
    await prisma.matchVerification.deleteMany({
      where: {
        match: {
          submittedBy: (await prisma.user.findUnique({ where: { walletAddress: '0xDEMO_HACKATHON_USER' } }))?.id
        }
      }
    });
    await prisma.match.deleteMany({
      where: {
        submittedBy: (await prisma.user.findUnique({ where: { walletAddress: '0xDEMO_HACKATHON_USER' } }))?.id
      }
    });
    console.log('✅ Cleanup complete\n');

    // Create dependencies
    const user = await createDemoUser();
    const squads = await createDemoSquads();

    console.log('\n⚽ Creating demo matches with CRE verification...\n');

    for (const demoMatch of DEMO_MATCHES) {
      console.log('=' .repeat(60));
      console.log(`📍 ${demoMatch.name}`);
      console.log(`   ${demoMatch.homeTeam} ${demoMatch.homeScore}-${demoMatch.awayScore} ${demoMatch.awayTeam}`);
      console.log(`   ${demoMatch.description}`);

      // Run CRE workflow
      const creResult = await runCREWorkflow(demoMatch);

      if (!creResult) {
        console.log('   ⚠️ Skipping match due to CRE failure');
        continue;
      }

      // Determine match status based on CRE confidence
      let status: 'pending' | 'verified' | 'disputed' | 'finalized' = 'pending';
      if (creResult.confidence >= 90) {
        status = 'verified';
      } else if (creResult.confidence >= 60) {
        status = 'pending';
      } else {
        status = 'disputed';
      }

      // Get squad IDs
      const homeSquad = squads[demoMatch.homeTeam];
      const awaySquad = squads[demoMatch.awayTeam];

      if (!homeSquad || !awaySquad) {
        console.log('   ❌ Squad not found, skipping');
        continue;
      }

      // Create match in database
      const matchData: any = {
        homeSquadId: homeSquad.id,
        awaySquadId: awaySquad.id,
        homeScore: demoMatch.homeScore,
        awayScore: demoMatch.awayScore,
        matchDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random time in last week
        submittedBy: user.id,
        status,
        latitude: demoMatch.latitude,
        longitude: demoMatch.longitude,
        weatherVerified: creResult.weather.verified,
        locationVerified: creResult.location.verified,
        verificationDetails: creResult as any,
      };
      
      // Only add txId if match is verified
      if (creResult.verified) {
        matchData.txId = `0x${Math.random().toString(16).substring(2, 10)}`;
      }

      const match = await prisma.match.create({
        data: matchData,
        include: {
          homeSquad: true,
          awaySquad: true,
        }
      });

      // Add verifications based on status
      // Note: We can't use the same user for multiple verifications due to unique constraint
      // So we'll just create one verification per match for the demo
      if (status === 'verified' || status === 'finalized') {
        await prisma.matchVerification.create({
          data: {
            matchId: match.id,
            verifierId: user.id,
            verified: true,
            homeScore: demoMatch.homeScore,
            awayScore: demoMatch.awayScore,
            trustTier: 'platinum',
          }
        });
      } else if (status === 'disputed') {
        await prisma.matchVerification.create({
          data: {
            matchId: match.id,
            verifierId: user.id,
            verified: false,
            homeScore: demoMatch.homeScore,
            awayScore: demoMatch.awayScore,
            trustTier: 'gold',
          }
        });
      } else {
        // For pending status, add just one verification
        await prisma.matchVerification.create({
          data: {
            matchId: match.id,
            verifierId: user.id,
            verified: true,
            homeScore: demoMatch.homeScore,
            awayScore: demoMatch.awayScore,
            trustTier: 'bronze',
          }
        });
      }

      console.log(`   ✅ Match created: ${match.id} (${status})`);
      console.log(`   🔗 Workflow: ${creResult.workflowId}`);
    }

    console.log('\n' + '=' .repeat(60));
    console.log('✅ Demo seeding complete!');
    console.log('\n📊 Summary:');
    console.log(`   - ${DEMO_MATCHES.length} demo matches created`);
    console.log(`   - CRE verification workflows executed`);
    console.log(`   - Ready for hackathon demo!`);
    console.log('\n🎬 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Navigate to: http://localhost:3000/match');
    console.log('   3. Show the demo matches with CRE verification badges');
    console.log('   4. Run: npx tsx scripts/test-chainlink.ts for terminal demo');

  } catch (error) {
    console.error('\n❌ Seeding failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedDemoMatches().catch(console.error);
