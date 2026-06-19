/**
 * Backfill Avatar Customization Fields
 *
 * Reports on the state of avatar customization fields after the migration.
 * All fields are nullable and the resolveAvatarData service handles nulls
 * via the fallback chain (squad colors → palette defaults), so this script
 * is informational — no data writes are needed.
 *
 * Optionally sets kitColor on squads that have no kit branding yet,
 * using the captain's preference or the V3 default palette.
 *
 * Usage:
 *   npx tsx scripts/maintenance/backfill-avatar-defaults.ts
 *   npx tsx scripts/maintenance/backfill-avatar-defaults.ts --set-kit-colors
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_KIT_COLOR = '#c91022';
const DEFAULT_ACCENT_COLOR = '#1c3a5e';

async function main() {
  const setKitColors = process.argv.includes('--set-kit-colors');

  const userCount = await prisma.user.count();
  const usersWithAvatar = await prisma.user.count({
    where: { avatarKitColor: { not: null } },
  });
  const squadCount = await prisma.squad.count({
    where: { isPlaceholder: false },
  });
  const squadsWithKit = await prisma.squad.count({
    where: { isPlaceholder: false, kitColor: { not: null } },
  });

  console.log(`Users: ${userCount} total, ${usersWithAvatar} with avatar customization`);
  console.log(`Squads: ${squadCount} real, ${squadsWithKit} with kit colors`);

  if (!setKitColors) {
    console.log('\nRun with --set-kit-colors to set default kit colors on squads without one.');
    return;
  }

  const squadsWithoutKit = await prisma.squad.findMany({
    where: { isPlaceholder: false, kitColor: null },
    select: { id: true, name: true },
  });

  console.log(`\nSetting default kit colors on ${squadsWithoutKit.length} squads...`);

  let updated = 0;
  for (const squad of squadsWithoutKit) {
    await prisma.squad.update({
      where: { id: squad.id },
      data: {
        kitColor: DEFAULT_KIT_COLOR,
        accentColor: DEFAULT_ACCENT_COLOR,
      },
    });
    updated++;
  }

  console.log(`Done — ${updated} squads updated.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
