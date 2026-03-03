import { PrismaClient } from '@prisma/client';
import { hash } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Seed AI Agents (Kite AI passports mocked)
  console.log('Deploying Kite AI Agents...');
  const aiAgents = [
    {
      agentId: 'agt_squad_manager_001',
      passportId: 'pass_sqm_001',
      name: 'SportWarren Squad Manager',
      type: 'squad_manager',
      description: 'AI agent for tactical analysis and squad rotation',
      capabilities: ['tactics', 'formation_analysis', 'rotation_management'],
    },
    {
      agentId: 'agt_scout_001',
      passportId: 'pass_sct_001',
      name: 'SportWarren Scout',
      type: 'scout',
      description: 'AI agent for opponent analysis and player scouting',
      capabilities: ['opponent_analysis', 'player_scouting', 'weakness_detection'],
    },
    {
      agentId: 'agt_fitness_001',
      passportId: 'pass_fit_001',
      name: 'SportWarren Fitness Coach',
      type: 'fitness',
      description: 'AI agent for fitness tracking and training recommendations',
      capabilities: ['fitness_tracking', 'training_plans', 'injury_prevention'],
    },
  ];

  for (const agent of aiAgents) {
    await prisma.aiAgent.upsert({
      where: { agentId: agent.agentId },
      update: {},
      create: agent,
    });
  }

  // 2. Seed Mock Users
  console.log('Creating mock users...');
  const user1 = await prisma.user.upsert({
    where: { walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
    update: {},
    create: {
      walletAddress: '0x1234567890abcdef1234567890abcdef12345678',
      chain: 'avalanche',
      name: 'Marcus Rashford (Mock)',
      position: 'Forward',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12' },
    update: {},
    create: {
      walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      chain: 'avalanche',
      name: 'Bukayo Saka (Mock)',
      position: 'Winger',
    },
  });

  // 3. Profiles
  await prisma.playerProfile.upsert({
    where: { userId: user1.id },
    update: {},
    create: {
      userId: user1.id,
      level: 5,
      totalXP: 5000,
      reputationScore: 95,
      attributes: {
        create: [
          { attribute: 'pace', rating: 88, maxRating: 99 },
          { attribute: 'shooting', rating: 85, maxRating: 99 },
          { attribute: 'passing', rating: 78, maxRating: 99 },
        ]
      }
    }
  });

  await prisma.playerProfile.upsert({
    where: { userId: user2.id },
    update: {},
    create: {
      userId: user2.id,
      level: 4,
      totalXP: 4200,
      reputationScore: 92,
      attributes: {
        create: [
          { attribute: 'pace', rating: 90, maxRating: 99 },
          { attribute: 'shooting', rating: 80, maxRating: 99 },
          { attribute: 'dribbling', rating: 86, maxRating: 99 },
        ]
      }
    }
  });

  // 4. Squads
  console.log('Creating mock squads...');
  const squad1 = await prisma.squad.create({
    data: {
      name: 'Red Devils Sunday League',
      shortName: 'RDSL',
      treasuryBalance: 1000,
      members: {
        create: {
          userId: user1.id,
          role: 'captain',
        }
      }
    },
  });

  const squad2 = await prisma.squad.create({
    data: {
      name: 'Gunners FC',
      shortName: 'GFC',
      treasuryBalance: 800,
      members: {
        create: {
          userId: user2.id,
          role: 'captain',
        }
      }
    },
  });

  // 5. Match (with Chainlink mocked state)
  console.log('Creating mock matches...');
  await prisma.match.create({
    data: {
      homeSquadId: squad1.id,
      awaySquadId: squad2.id,
      homeScore: 2,
      awayScore: 1,
      submittedBy: user1.id,
      status: 'verified',
      matchDate: new Date(),
      latitude: 53.4631, // Old Trafford coords
      longitude: -2.2913,
      weatherVerified: true,
      locationVerified: true,
    }
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
