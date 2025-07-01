# SportWarren - Issues to Fix

**Created:** 2024-12-19  
**Status:** In Progress  
**Priority:** High  

This document tracks all the issues identified during the project reorganization and cleanup. These need to be addressed to get the application running properly.

## Table of Contents

- [Critical Issues (Blocking App Startup)](#critical-issues-blocking-app-startup)
- [TypeScript/Build Issues](#typescriptbuild-issues)
- [Algorand SDK Integration Issues](#algorand-sdk-integration-issues)
- [Missing Component Issues](#missing-component-issues)
- [Configuration Issues](#configuration-issues)
- [File Path Issues](#file-path-issues)
- [Code Quality Issues](#code-quality-issues)
- [Documentation Issues](#documentation-issues)

---

## Critical Issues (Blocking App Startup)

### 🚨 Priority 1: Build Failures

1. **Incomplete React Components**
   - `src/components/algorand/SquadDAO.tsx` - Missing proper JSX return and component closure ✅ FIXED
   - `server/services/blockchain/algorand.ts` - Missing class closure and exports ✅ FIXED

2. **Import/Export Issues**
   - Several components imported but not properly exported
   - Missing component definitions causing build failures

3. **ESBuild Transform Errors**
   - Transform failed with syntax errors in TypeScript files
   - Unexpected end of file errors

---

## TypeScript/Build Issues

### Type Definition Problems

1. **Algorand SDK Type Issues**
   - `makeApplicationCreateTxn` function doesn't exist in current SDK version
   - Should use `makeApplicationCreateTxnFromObject` instead
   - Property names have changed (e.g., `application-index` → `applicationIndex`)

2. **Response Type Mismatches**
   - `PendingTransactionResponse` vs `Record<string, any>` conflicts
   - `PostTransactionsResponse` property access issues

3. **Generic Type Issues**
   - Multiple `Unexpected any` errors throughout codebase
   - Need proper type definitions for API responses

### Specific TypeScript Errors to Fix

```typescript
// In server/services/blockchain/algorand.ts
- Line 73: makeApplicationCreateTxn doesn't exist
- Line 94: 'application-index' should be 'applicationIndex'
- Line 150: makeApplicationCreateTxn doesn't exist
- Line 199: microAlgosToAlgos should be microalgosToAlgos
- Line 209: 'health' property doesn't exist on AlgodClient
- Line 426: 'global-state' should be 'globalState'
- Line 496: 'apps-local-state' should be 'appsLocalState'
```

---

## Algorand SDK Integration Issues

### API Function Mismatches

1. **Transaction Creation Functions**
   ```typescript
   // WRONG:
   algosdk.makeApplicationCreateTxn(...)
   
   // CORRECT:
   algosdk.makeApplicationCreateTxnFromObject({
     sender: address,
     suggestedParams: params,
     // ... other params
   })
   ```

2. **Property Name Changes**
   ```typescript
   // WRONG:
   confirmedTxn['application-index']
   accountInfo['apps-local-state']
   appInfo['params']['global-state']
   
   // CORRECT:
   confirmedTxn.applicationIndex
   accountInfo.appsLocalState
   appInfo.params.globalState
   ```

3. **Function Name Changes**
   ```typescript
   // WRONG:
   algosdk.microAlgosToAlgos()
   
   // CORRECT:
   algosdk.microalgosToAlgos()
   ```

### Missing SDK Functions

1. **Opt-in Functions**
   - `makeApplicationOptInTxn` may not exist
   - Need to verify correct function names in current SDK version

2. **NoOp Transaction Functions**
   - `makeApplicationNoOpTxn` usage needs verification
   - May need different approach for application calls

---

## Missing Component Issues

### Algorand Components

1. **AlgorandWallet Component**
   - Referenced in App.tsx but component file missing or incomplete
   - Need to implement wallet connection logic

2. **Component Dependencies**
   - `Card` component imported but may not exist in `../common/Card`
   - Need to verify all component imports

### Missing Utility Components

1. **Common UI Components**
   - Card, Button, Input components may be missing
   - Need consistent UI component library

2. **Hook Dependencies**
   - `useSocket` and `useUserPreferences` hooks referenced
   - Need to verify implementation exists

---

## Configuration Issues

### Environment Variables

1. **Missing .env Configuration**
   - Algorand node URLs and tokens not properly configured
   - Need to set up proper environment variables for all networks

2. **Smart Contract Paths**
   - File paths in algorand.ts still reference old root-level .teal files
   - Need to update paths to new `contracts/` directory structure

### Build Configuration

1. **Path Resolution Issues**
   ```typescript
   // WRONG:
   path.resolve(__dirname, '../../../squad_dao_approval.teal')
   
   // CORRECT:
   path.resolve(__dirname, '../../../contracts/squad_dao/approval.teal')
   ```

---

## File Path Issues

### Smart Contract Path Updates Needed

Update all references in `server/services/blockchain/algorand.ts`:

```typescript
// Current (WRONG):
'../../../squad_dao_approval.teal'
'../../../squad_dao_clear_state.teal'
'../../../match_verification_approval.teal'
'../../../match_verification_clear_state.teal'

// Should be (CORRECT):
'../../../contracts/squad_dao/approval.teal'
'../../../contracts/squad_dao/clear_state.teal'
'../../../contracts/match_verification/approval.teal'
'../../../contracts/match_verification/clear_state.teal'
```

---

## Code Quality Issues

### ESLint/Prettier Issues

1. **Unused Variables**
   - Multiple unused imports and variables
   - Need cleanup pass for code quality

2. **Inconsistent Formatting**
   - Mix of quote styles and formatting
   - Need to run prettier on entire codebase

### Performance Issues

1. **Unnecessary Re-renders**
   - Some useEffect dependencies may cause excessive re-renders
   - Need to optimize React hooks

---

## Documentation Issues

### Missing Documentation

1. **API Documentation**
   - Need to document all GraphQL resolvers
   - API endpoints need proper documentation

2. **Smart Contract Documentation**
   - Individual contract README files needed
   - Function specifications missing

### Outdated Documentation

1. **README Updates**
   - Main README may have outdated setup instructions
   - Need to update for new project structure

---

## Action Plan

### Phase 1: Critical Fixes (Get App Running)

1. **Fix Algorand SDK Integration**
   - [ ] Update all SDK function calls to correct API
   - [ ] Fix property name mismatches
   - [ ] Add proper type definitions

2. **Fix File Path References**
   - [ ] Update smart contract paths in algorand.ts
   - [ ] Verify all import paths are correct

3. **Complete Missing Components**
   - [ ] Implement missing AlgorandWallet component
   - [ ] Verify all imported components exist

### Phase 2: Quality and Stability

1. **TypeScript Cleanup**
   - [ ] Remove all `any` types
   - [ ] Add proper type definitions
   - [ ] Fix all TypeScript errors

2. **Code Quality**
   - [ ] Remove unused imports/variables
   - [ ] Run prettier on entire codebase
   - [ ] Fix all ESLint warnings

### Phase 3: Testing and Documentation

1. **Testing**
   - [ ] Add unit tests for Algorand service
   - [ ] Add integration tests for smart contracts
   - [ ] Test all deployment scripts

2. **Documentation**
   - [ ] Complete API documentation
   - [ ] Add smart contract documentation
   - [ ] Update setup guides

---

## Specific Files Needing Attention

### High Priority

1. `server/services/blockchain/algorand.ts` - Complete rewrite with correct SDK
2. `src/components/algorand/SquadDAO.tsx` - Component completion ✅ FIXED
3. `scripts/deploy-contracts.ts` - SDK integration fixes ✅ FIXED
4. `src/App.tsx` - Route and import fixes

### Medium Priority

1. `src/components/algorand/AlgorandWallet.tsx` - Implementation needed
2. `src/components/common/Card.tsx` - Verify exists or create
3. `server/graphql/resolvers.ts` - Algorand integration
4. Environment configuration files

### Low Priority

1. Documentation files
2. Test files
3. Configuration optimizations

---

## Testing Checklist

Before marking issues as complete, verify:

- [ ] `npm run dev` starts without errors
- [ ] All TypeScript files compile without errors
- [ ] No ESLint errors remain
- [ ] Smart contract deployment scripts work
- [ ] Frontend renders without crashes
- [ ] GraphQL API responds correctly

---

## Notes

- Keep all original functionality during fixes
- Maintain backward compatibility where possible
- Document any breaking changes
- Test thoroughly before deployment

**Last Updated:** 2024-12-19  
**Next Review:** After Phase 1 completion