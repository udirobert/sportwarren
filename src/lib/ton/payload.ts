import { beginCell, toNano } from '@ton/core';

export function buildTonCommentPayload(comment: string): string {
  return beginCell()
    .storeUint(0, 32)
    .storeStringTail(comment)
    .endCell()
    .toBoc()
    .toString('base64');
}

export function toTonNanoString(amountTon: number): string {
  return toNano(amountTon.toString()).toString();
}
