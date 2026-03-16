interface TreasuryLike {
  balance?: number;
  budgets?: {
    wages?: number;
  };
  allowances?: {
    weeklyWages?: number;
  };
}

export function getWageBudget(treasury: TreasuryLike | null | undefined): number {
  if (!treasury) return 0;
  if (typeof treasury.allowances?.weeklyWages === 'number') {
    return treasury.allowances.weeklyWages;
  }
  if (typeof treasury.budgets?.wages === 'number') {
    return treasury.budgets.wages;
  }
  return 0;
}

export function getTreasuryStatus(treasury: TreasuryLike | null | undefined) {
  const wageBudget = getWageBudget(treasury);
  const balance = typeof treasury?.balance === 'number' ? treasury.balance : 0;
  return {
    wageBudget,
    balance,
    needsAttention: wageBudget > 0 && balance < wageBudget,
  };
}
