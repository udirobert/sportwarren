import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const GOAT_RPC_URL = process.env.GOAT_RPC_URL || 'https://rpc.testnet3.goat.network';

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address');
  if (!address || !ethers.isAddress(address)) {
    return NextResponse.json({ error: 'Invalid address' }, { status: 400 });
  }

  try {
    const provider = new ethers.JsonRpcProvider(GOAT_RPC_URL);
    const balance = await provider.getBalance(address);
    return NextResponse.json({
      balance: Number(ethers.formatEther(balance)),
      address,
      chainId: Number(process.env.GOAT_CHAIN_ID || 48816),
    });
  } catch (error) {
    console.error('GOAT Network balance fetch failed:', error);
    return NextResponse.json({ balance: 0, error: 'Failed to fetch balance' }, { status: 500 });
  }
}
