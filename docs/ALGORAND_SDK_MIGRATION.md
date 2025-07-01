# Algorand SDK Migration Guide

**Target:** Update SportWarren codebase to use correct Algorand SDK v3.x APIs  
**Status:** ✅ COMPLETED  
**Priority:** Critical  

This document provides specific code changes needed to fix Algorand SDK integration issues in SportWarren.

## Overview

The current codebase uses outdated or incorrect Algorand SDK function names and property access patterns. This guide provides exact replacements needed to make the code work with the current SDK version.

## Critical Function Replacements

### 1. Application Creation Functions

**❌ WRONG:**
```typescript
const createTxn = algosdk.makeApplicationCreateTxn(
  creatorAccount.addr,
  suggestedParams,
  algosdk.OnApplicationComplete.NoOpOC,
  approvalProgram,
  clearStateProgram,
  numLocalInts,
  numLocalBytes,
  numGlobalInts,
  numGlobalBytes
);
```

**✅ CORRECT:**
```typescript
const createTxn = algosdk.makeApplicationCreateTxnFromObject({
  sender: creatorAccount.addr,
  suggestedParams: suggestedParams,
  onComplete: algosdk.OnApplicationComplete.NoOpOC,
  approvalProgram: approvalProgram,
  clearProgram: clearStateProgram,
  numLocalInts: numLocalInts,
  numLocalByteSlices: numLocalBytes,
  numGlobalInts: numGlobalInts,
  numGlobalByteSlices: numGlobalBytes
});
```

### 2. Application Opt-In Functions

**❌ WRONG:**
```typescript
const optInTxn = algosdk.makeApplicationOptInTxn(
  userAddress,
  suggestedParams,
  appId
);
```

**✅ CORRECT:**
```typescript
const optInTxn = algosdk.makeApplicationOptInTxnFromObject({
  sender: userAddress,
  suggestedParams: suggestedParams,
  appIndex: appId
});
```

### 3. Application Call Functions

**❌ WRONG:**
```typescript
const appCallTxn = algosdk.makeApplicationNoOpTxn(
  senderAddress,
  suggestedParams,
  appId,
  appArgs
);
```

**✅ CORRECT:**
```typescript
const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
  sender: senderAddress,
  suggestedParams: suggestedParams,
  appIndex: appId,
  onComplete: algosdk.OnApplicationComplete.NoOpOC,
  appArgs: appArgs
});
```

## Property Access Updates

### 1. Transaction Response Properties

**❌ WRONG:**
```typescript
const appId = confirmedTxn['application-index'];
const txId = txResponse.txId;
```

**✅ CORRECT:**
```typescript
const appId = confirmedTxn.applicationIndex;
const txId = txResponse.txid;
```

### 2. Account Information Properties

**❌ WRONG:**
```typescript
const appLocalState = accountInfo['apps-local-state'];
const globalState = appInfo['params']['global-state'];
```

**✅ CORRECT:**
```typescript
const appLocalState = accountInfo.appsLocalState;
const globalState = appInfo.params.globalState;
```

### 3. Network Status Properties

**❌ WRONG:**
```typescript
const lastRound = status['last-round'];
const timeSince = status['time-since-last-round'];
const catchupTime = status['catchup-time'];
```

**✅ CORRECT:**
```typescript
const lastRound = status.lastRound;
const timeSince = status.timeSinceLastRound;
const catchupTime = status.catchupTime;
```

## Utility Function Updates

### 1. Conversion Functions

**❌ WRONG:**
```typescript
const balance = algosdk.microAlgosToAlgos(accountInfo.amount);
```

**✅ CORRECT:**
```typescript
const balance = algosdk.microalgosToAlgos(accountInfo.amount);
```

### 2. Encoding/Decoding Functions

**❌ WRONG:**
```typescript
const decoded = algosdk.decodeUint64(buffer, 'safe');
```

**✅ CORRECT:**
```typescript
const decoded = algosdk.decodeUint64(buffer, 'mixed');
```

## Transaction Signing Updates

### Current Pattern (Correct)
```typescript
const signedTxn = createTxn.signTxn(account.sk);
const txId = createTxn.txID().toString();
await algodClient.sendRawTransaction(signedTxn).do();
```

This pattern is already correct and doesn't need changes.

## File-by-File Migration Tasks

### `server/services/blockchain/algorand.ts`

**Lines to Update:**

1. **Line 73** - Application creation function
2. **Line 94** - Property access `application-index` → `applicationIndex`
3. **Line 150** - Application creation function
4. **Line 171** - Property access `application-index` → `applicationIndex`
5. **Line 199** - Function name `microAlgosToAlgos` → `microalgosToAlgos`
6. **Line 234** - Opt-in function
7. **Line 286** - NoOp function
8. **Line 337** - NoOp function
9. **Line 386** - NoOp function
10. **Line 426** - Property access `global-state` → `globalState`
11. **Line 496** - Property access `apps-local-state` → `appsLocalState`
12. **Line 530** - Property access `global-state` → `globalState`
13. **Line 590** - Opt-in function
14. **Line 653** - NoOp function
15. **Line 717** - NoOp function
16. **Line 772** - NoOp function
17. **Line 834** - NoOp function
18. **Line 868** - Property access `apps-local-state` → `appsLocalState`
19. **Line 906** - Property access `global-state` → `globalState`

### `scripts/deploy-contracts.ts`

**Already Fixed** ✅ - This file has been updated with correct SDK usage.

## Type Definition Updates

### Add Proper Imports
```typescript
import algosdk, {
  Algodv2,
  Indexer,
  mnemonicToSecretKey,
  getApplicationAddress,
  OnApplicationComplete,
  makeApplicationCreateTxnFromObject,
  makeApplicationOptInTxnFromObject,
  makeApplicationCallTxnFromObject,
  microalgosToAlgos,
  waitForConfirmation
} from 'algosdk';
```

### Update Type Annotations
```typescript
// Replace generic 'any' types with specific types
private async waitForTransaction(txId: string): Promise<algosdk.ConfirmedTxInfo> {
  // Implementation
}
```

## Testing Strategy

### Unit Tests Needed
1. **Application Creation** - Test deployment functions
2. **Opt-in Transactions** - Test user opt-in flow
3. **Application Calls** - Test proposal creation/voting
4. **Property Access** - Test response parsing

### Integration Tests
1. **End-to-End Deployment** - Full contract deployment
2. **Transaction Flow** - Complete user interaction flow
3. **Network Compatibility** - Test on testnet/mainnet

## Migration Checklist

### Phase 1: Core Functions ✅ COMPLETED
- [x] Update application creation functions
- [x] Update opt-in functions  
- [x] Update application call functions
- [x] Update property access patterns

### Phase 2: Utilities ✅ COMPLETED
- [x] Update conversion functions
- [x] Update encoding/decoding functions
- [x] Update type definitions
- [x] Remove deprecated function calls

### Phase 3: Testing
- [ ] Add unit tests for all updated functions
- [ ] Test against Algorand testnet
- [ ] Verify deployment scripts work
- [ ] Test full application flow

## Common Errors and Solutions

### Error: `makeApplicationCreateTxn is not a function`
**Solution:** Use `makeApplicationCreateTxnFromObject` instead

### Error: `Cannot read property 'application-index'`
**Solution:** Use `applicationIndex` property instead

### Error: `microAlgosToAlgos is not a function`
**Solution:** Use `microalgosToAlgos` (note the lowercase 'a')

### Error: `Cannot read property 'global-state'`
**Solution:** Use `globalState` property instead

## Resources

- [Algorand JavaScript SDK Documentation](https://algorand.github.io/js-algorand-sdk/)
- [Algorand Developer Portal](https://developer.algorand.org/)
- [SDK Migration Guide](https://developer.algorand.org/docs/sdks/javascript/)

## Notes

- Always test changes on Algorand testnet first
- Keep transaction IDs for debugging
- Use proper error handling for all async operations
- Maintain backward compatibility where possible

**Last Updated:** 2024-12-19  
**Status:** ✅ MIGRATION COMPLETED

## Summary of Changes Made

### ✅ Fixed Function Names
- Updated all `makeApplicationCreateTxn` → `makeApplicationCreateTxnFromObject`
- Updated all `makeApplicationOptInTxn` → `makeApplicationOptInTxnFromObject`
- Updated all `makeApplicationNoOpTxn` → `makeApplicationCallTxnFromObject`
- Updated `microAlgosToAlgos` → `microalgosToAlgos`

### ✅ Fixed Property Access
- Updated `confirmedTxn['application-index']` → `confirmedTxn.applicationIndex`
- Updated `appInfo['params']['global-state']` → `appInfo.params.globalState`
- Updated `accountInfo['apps-local-state']` → `accountInfo.appsLocalState`
- Updated `appLocalState['key-value']` → `appLocalState.keyValue`
- Updated `status['last-round']` → `status.lastRound`
- Updated `status['time-since-last-round']` → `status.timeSinceLastRound`
- Updated `status['catchup-time']` → `status.catchupTime`

### ✅ Fixed Type Issues
- Added proper type conversions for `bigint` to `number`
- Fixed Buffer handling for Uint8Array vs string
- Updated decoding functions to handle mixed types
- Removed deprecated `health()` method call

### ✅ Files Updated
- `server/services/blockchain/algorand.ts` - Complete migration
- `src/lib/algorand.ts` - Property access and function name fixes

**Next Steps:** Testing phase can now begin with the updated SDK integration.