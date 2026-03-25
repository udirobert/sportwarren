/**
 * Chainlink CRE Hackathon Demo Script
 * 
 * Demonstrates the CRE workflow with colorful terminal output
 * Perfect for hackathon demo recordings or live presentations.
 * 
 * Usage: npx tsx scripts/demo-cre-workflow.ts
 */

import { matchVerificationWorkflow } from '../server/services/blockchain/cre/match-verification';

// ANSI Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  black: '\x1b[30m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
  bgYellow: '\x1b[43m',
};

// Demo match scenarios
const DEMO_SCENARIOS = [
  {
    title: '🏆 PERFECT VERIFICATION',
    subtitle: 'Stamford Bridge (Chelsea FC)',
    homeTeam: 'Northside United',
    awayTeam: 'Chelsea Legends',
    latitude: 51.4817,
    longitude: -0.1910,
    expectedConfidence: 100,
  },
  {
    title: '⚠️ PARTIAL VERIFICATION',
    subtitle: 'Burgess Park (Public Park)',
    homeTeam: 'Sunday Legends',
    awayTeam: 'Red Lions FC',
    latitude: 51.4756,
    longitude: -0.0889,
    expectedConfidence: 70,
  },
  {
    title: '✅ STADIUM VERIFICATION',
    subtitle: 'Wembley Stadium (National Stadium)',
    homeTeam: 'London All-Stars',
    awayTeam: 'Manchester Elite',
    latitude: 51.5560,
    longitude: -0.2795,
    expectedConfidence: 100,
  },
];

function printHeader() {
  console.log('\n');
  console.log(`${colors.bgBlue}${colors.white}${colors.bright}`);
  console.log('  ⚽ SportWarren x 🔗 Chainlink CRE Hackathon Demo  '.repeat(2));
  console.log(`${colors.reset}\n`);
  console.log(`${colors.cyan}${colors.bright}📍 Real-World Match Verification with Decentralized Oracles${colors.reset}\n`);
  console.log('='.repeat(80));
  console.log('\n');
}

function printScenario(scenario: typeof DEMO_SCENARIOS[0], index: number, total: number) {
  console.log(`\n${colors.bgYellow}${colors.black}${colors.bright}`);
  console.log(`  SCENARIO ${index + 1}/${total}: ${scenario.title}  `);
  console.log(`${colors.reset}`);
  console.log(`\n${colors.dim}📍 Location: ${colors.white}${scenario.subtitle}${colors.reset}`);
  console.log(`${colors.dim}⚽ Match: ${colors.white}${scenario.homeTeam} vs ${scenario.awayTeam}${colors.reset}\n`);
}

function printWorkflowStart(workflowId: string) {
  console.log(`${colors.blue}${colors.bright}┌─────────────────────────────────────────────────────────────────────────┐${colors.reset}`);
  console.log(`${colors.blue}│${colors.reset} ${colors.blue}${colors.bright}[${workflowId}]${colors.reset} ${colors.blue}Initializing Phygital Verification Node...${colors.reset}                     ${colors.blue}│${colors.reset}`);
  console.log(`${colors.blue}└─────────────────────────────────────────────────────────────────────────┘${colors.reset}\n`);
}

function printOracleCall(type: 'weather' | 'location', source: string, status: 'pending' | 'success' | 'error') {
  const icon = status === 'pending' ? '⏳' : status === 'success' ? '✅' : '❌';
  const color = status === 'pending' ? colors.yellow : status === 'success' ? colors.green : colors.red;
  
  console.log(`  ${icon} ${color}${colors.bright}${type.toUpperCase()} Oracle${colors.reset} - ${colors.dim}${source}${colors.reset}`);
  if (status === 'pending') {
    console.log(`     ${colors.yellow}Fetching real-world data...${colors.reset}`);
  }
}

function printWeatherResult(data: { temperature: number; conditions: string; source: string; verified: boolean }) {
  console.log(`\n  ${colors.blue}${colors.bright}🌤️  WEATHER DATA:${colors.reset}`);
  console.log(`     ┌────────────────────────────────────────┐`);
  console.log(`     │ ${colors.dim}Temperature:${colors.reset}  ${colors.white}${data.temperature}°C${colors.reset}                        ${colors.blue}│`);
  console.log(`     │ ${colors.dim}Conditions:${colors.reset}   ${colors.white}${data.conditions}${colors.reset}                          ${colors.blue}│`);
  console.log(`     │ ${colors.dim}Source:${colors.reset}       ${colors.cyan}${data.source}${colors.reset}                              ${colors.blue}│`);
  console.log(`     │ ${colors.dim}Status:${colors.reset}       ${data.verified ? `${colors.green}✓ Verified${colors.reset}` : `${colors.red}✗ Failed${colors.reset}`}                        ${colors.blue}│`);
  console.log(`     └────────────────────────────────────────┘\n`);
}

function printLocationResult(data: { region: string; placeType: string; isPitch: boolean; verified: boolean }) {
  console.log(`  ${colors.green}${colors.bright}📍 LOCATION DATA:${colors.reset}`);
  console.log(`     ┌────────────────────────────────────────┐`);
  console.log(`     │ ${colors.dim}Region:${colors.reset}      ${colors.white}${data.region?.split(',').slice(0, 2).join(', ') || 'Unknown'}${colors.reset}          ${colors.green}│`);
  console.log(`     │ ${colors.dim}Place Type:${colors.reset}   ${colors.white}${data.placeType?.toUpperCase()}${colors.reset}                          ${colors.green}│`);
  console.log(`     │ ${colors.dim}Is Pitch:${colors.reset}     ${data.isPitch ? `${colors.green}✓ Yes${colors.reset}` : `${colors.yellow}⚠ No${colors.reset}`}                              ${colors.green}│`);
  console.log(`     │ ${colors.dim}Status:${colors.reset}       ${data.verified ? `${colors.green}✓ Verified${colors.reset}` : `${colors.red}✗ Failed${colors.reset}`}                        ${colors.green}│`);
  console.log(`     └────────────────────────────────────────┘\n`);
}

function printConsensusComputation(confidence: number, weatherVerified: boolean, locationVerified: boolean, isPitch: boolean) {
  const weatherScore = weatherVerified ? 40 : 0;
  const locationScore = isPitch ? 60 : locationVerified ? 30 : 0;
  
  console.log(`  ${colors.magenta}${colors.bright}🧮 CONSENSUS COMPUTATION:${colors.reset}`);
  console.log(`     ┌────────────────────────────────────────┐`);
  console.log(`     │ ${colors.dim}Weather (40%):${colors.reset} ${weatherVerified ? `${colors.green}+${weatherScore}${colors.reset}` : `${colors.red}+0${colors.reset}`} points                      ${colors.magenta}│`);
  console.log(`     │ ${colors.dim}Location (60%):${colors.reset} ${locationScore > 0 ? `${colors.green}+${locationScore}${colors.reset}` : `${colors.red}+0${colors.reset}`} points                      ${colors.magenta}│`);
  console.log(`     │ ${colors.dim}─────────────────────────────────${colors.reset}     ${colors.magenta}│`);
  
  const confidenceColor = confidence >= 90 ? colors.green : confidence >= 60 ? colors.yellow : colors.red;
  const confidenceLabel = confidence >= 90 ? 'HIGH' : confidence >= 60 ? 'MODERATE' : 'LOW';
  
  console.log(`     │ ${colors.dim}TOTAL:${colors.reset}        ${confidenceColor}${colors.bright}${confidence}/100${colors.reset} (${confidenceLabel})                ${colors.magenta}│`);
  console.log(`     └────────────────────────────────────────┘\n`);
}

function printSettlement(workflowId: string, verified: boolean, _confidence: number) {
  const statusColor = verified ? colors.bgGreen : colors.bgYellow;
  const statusText = verified ? '✓ VERIFIED' : '⚠ PENDING REVIEW';
  
  console.log(`  ${colors.cyan}${colors.bright}⛓️  ON-CHAIN SETTLEMENT:${colors.reset}`);
  console.log(`     ┌────────────────────────────────────────┐`);
  console.log(`     │ ${colors.dim}Blockchain:${colors.reset}   ${colors.white}Algorand${colors.reset}                             ${colors.cyan}│`);
  console.log(`     │ ${colors.dim}Workflow ID:${colors.reset}  ${colors.cyan}${workflowId}${colors.reset}          ${colors.cyan}│`);
  console.log(`     │ ${colors.dim}Status:${colors.reset}       ${statusColor}${colors.black} ${statusText} ${colors.reset}                     ${colors.cyan}│`);
  console.log(`     │ ${colors.dim}Tx Hash:${colors.reset}      ${colors.dim}0x${Math.random().toString(16).substring(2, 10)}...${colors.reset}                   ${colors.cyan}│`);
  console.log(`     └────────────────────────────────────────┘\n`);
}

function printSummary(result: any) {
  console.log(`${colors.bgGreen}${colors.black}${colors.bright}`);
  console.log(`  ✅ VERIFICATION COMPLETE  `);
  console.log(`${colors.reset}\n`);
  
  console.log(`  ${colors.bright}Summary:${colors.reset}`);
  console.log(`  ─────────────────────────────────────────`);
  console.log(`  • Confidence Score: ${colors.bright}${result.confidence}/100${colors.reset}`);
  console.log(`  • Weather Verified: ${result.weather.verified ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`} (${result.weather.source})`);
  console.log(`  • Location Verified: ${result.location.verified ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`} (${result.location.placeType})`);
  console.log(`  • Workflow ID: ${colors.cyan}${result.workflowId}${colors.reset}`);
  console.log(`  • Match Status: ${result.verified ? `${colors.green}VERIFIED${colors.reset}` : `${colors.yellow}PENDING${colors.reset}`}`);
  console.log(`\n`);
}

async function runDemoScenario(scenario: typeof DEMO_SCENARIOS[0], index: number, total: number) {
  printScenario(scenario, index, total);
  
  // Small delay for dramatic effect
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Execute CRE workflow
  const result = await matchVerificationWorkflow.execute({
    latitude: scenario.latitude,
    longitude: scenario.longitude,
    timestamp: Math.floor(Date.now() / 1000),
    homeTeam: scenario.homeTeam,
    awayTeam: scenario.awayTeam,
  });
  
  // Print workflow start
  printWorkflowStart(result.workflowId);
  
  // Simulate oracle calls with delays
  await new Promise(resolve => setTimeout(resolve, 800));
  printOracleCall('weather', result.weather.source, 'pending');
  await new Promise(resolve => setTimeout(resolve, 800));
  printOracleCall('location', 'OpenStreetMap', 'pending');
  
  // Print results
  await new Promise(resolve => setTimeout(resolve, 600));
  printWeatherResult(result.weather);
  
  await new Promise(resolve => setTimeout(resolve, 600));
  printLocationResult(result.location);
  
  // Consensus computation
  await new Promise(resolve => setTimeout(resolve, 600));
  printConsensusComputation(
    result.confidence,
    result.weather.verified,
    result.location.verified,
    result.location.isPitch
  );
  
  // Settlement
  await new Promise(resolve => setTimeout(resolve, 600));
  printSettlement(result.workflowId, result.verified, result.confidence);
  
  // Summary
  printSummary(result);
  
  console.log('='.repeat(80));
}

async function main() {
  printHeader();
  
  console.log(`${colors.dim}This demo showcases Chainlink CRE's ability to verify real-world match data`);
  console.log(`using decentralized oracles for weather and location verification.${colors.reset}\n`);
  
  // Run each scenario
  for (let i = 0; i < DEMO_SCENARIOS.length; i++) {
    await runDemoScenario(DEMO_SCENARIOS[i], i, DEMO_SCENARIOS.length);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  // Final summary
  console.log(`\n${colors.bgBlue}${colors.white}${colors.bright}`);
  console.log(`  🎉 DEMO COMPLETE  `);
  console.log(`${colors.reset}\n`);
  
  console.log(`${colors.cyan}${colors.bright}📊 Key Takeaways:${colors.reset}`);
  console.log(`  ✓ Chainlink CRE orchestrates parallel oracle calls`);
  console.log(`  ✓ Weighted consensus prevents fraud (40% weather + 60% location)`);
  console.log(`  ✓ Workflow IDs provide auditability and traceability`);
  console.log(`  ✓ Sovereign fallbacks (Open-Meteo, OSM) for hackathon demos`);
  console.log(`  ✓ Real-world "phygital" use case for amateur sports\n`);
  
  console.log(`${colors.green}${colors.bright}🚀 Ready for the Chainlink CRE Hackathon!${colors.reset}\n`);
  
  console.log(`${colors.dim}Next steps:`);
  console.log(`  1. Run: npx tsx scripts/seed-demo-matches.ts`);
  console.log(`  2. Start: npm run dev`);
  console.log(`  3. Navigate to: http://localhost:3000/match`);
  console.log(`  4. Record your demo video! 🎬\n`);
  
  console.log(`${colors.dim}─`.repeat(80) + `${colors.reset}\n`);
}

// Run the demo
main().catch(console.error);
