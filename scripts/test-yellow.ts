import { yellowService } from '../server/services/blockchain/yellow';

async function main() {
  const status = yellowService.getRailStatus();
  console.log('Yellow rail status:', status);

  const treasury = await yellowService.depositToTreasury({
    squadId: 'demo-squad',
    walletAddress: '0xdemo',
    amount: 10,
  });

  const escrow = await yellowService.createTransferEscrow({
    offerId: 'demo-offer',
    buyerAddress: '0xbuyer',
    sellerAddress: '0xseller',
    amount: 25,
  });

  const match = await yellowService.createMatchFeeSession({
    matchId: 'demo-match',
    homeSquadId: 'home',
    awaySquadId: 'away',
    feeAmount: yellowService.getMatchFeeAmount(),
  });

  console.log('Treasury session:', treasury);
  console.log('Escrow session:', escrow);
  console.log('Match fee session:', match);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
