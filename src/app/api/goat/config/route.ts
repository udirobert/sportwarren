import { NextResponse } from 'next/server';
import { getGoatPublicConfig } from '@/server/services/blockchain/goat-erc8004';

export async function GET() {
  return NextResponse.json(getGoatPublicConfig());
}
