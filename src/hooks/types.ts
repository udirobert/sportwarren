/**
 * Standardized Hook Return Types
 * Consistent patterns across all hooks
 */

// ============================================================================
// BASE TYPES
// ============================================================================

/**
 * Standard async operation state
 * All data-fetching hooks should use this pattern
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Standard mutation state
 * For hooks that perform mutations/updates
 */
export interface MutationState<T = void> {
  mutate: (data: T) => Promise<void>;
  loading: boolean;
  error: string | null;
}

// ============================================================================
// COMMON HOOK RETURN TYPES
// ============================================================================

/**
 * Standard pattern for data-fetching hooks
 * @example
 * interface UseSomethingReturn extends FetchHookReturn<Something> {
 *   // additional methods
 *   refetch: () => Promise<void>;
 *   create: (data: CreateInput) => Promise<void>;
 * }
 */
export interface FetchHookReturn<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
}

/**
 * Standard pattern for list/collection hooks
 */
export interface ListHookReturn<T> extends AsyncState<T[]> {
  refetch: () => Promise<void>;
  create: (item: Omit<T, 'id'>) => Promise<T | null>;
  update: (id: string, updates: Partial<T>) => Promise<void>;
  remove: (id: string) => Promise<void>;
}

/**
 * Standard pattern for single item hooks
 */
export interface ItemHookReturn<T> extends AsyncState<T> {
  refetch: () => Promise<void>;
  update: (updates: Partial<T>) => Promise<void>;
  remove: () => Promise<void>;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Pagination result
 */
export interface PaginationResult<T> {
  items: T[];
  total: number;
  hasMore: boolean;
  nextPage: number | null;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  field: string;
  value: string | number | boolean;
  operator: 'eq' | 'ne' | 'gt' | 'lt' | 'contains';
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Standard error structure
 */
export interface HookError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Helper to create consistent error state
 */
export function createErrorState(error: unknown): { error: string; data: null } {
  if (error instanceof Error) {
    return { error: error.message, data: null };
  }
  if (typeof error === 'string') {
    return { error, data: null };
  }
  return { error: 'An unknown error occurred', data: null };
}

/**
 * Helper to create loading state
 */
export function createLoadingState<T>(): AsyncState<T> {
  return { data: null, loading: true, error: null };
}

/**
 * Helper to create success state
 */
export function createSuccessState<T>(data: T): AsyncState<T> {
  return { data, loading: false, error: null };
}
