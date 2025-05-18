import {
  useState,
  useEffect,
  useRef
} from 'react';

interface DebounceOptions {
  /** The delay in milliseconds */
  delay?: number;
  /** The maximum delay in milliseconds before the value is updated */
  maxDelay?: number;
  /** Whether to update the value immediately on the leading edge of the timeout */
  leading?: boolean;
  /** Whether to update the value on the trailing edge of the timeout */
  trailing?: boolean;
}

/**
 * A hook that debounces a value with the specified options.
 * @param value The value to debounce
 * @param options The debounce options
 * @returns The debounced value
 * @example
 * ```tsx
 * const debouncedValue = useDebounce(value, {
 *   delay: 300,
 *   maxDelay: 1000,
 *   leading: true,
 *   trailing: true
 * });
 * ```
 */
export function useDebounce<T>(
  value: T,
  options: DebounceOptions = {},
): T {
  const {
    delay = 300,
    maxDelay,
    leading = false,
    trailing = true,
  } = options;

  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const maxTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Handle leading edge
    if (leading && isFirstRender.current) {
      setDebouncedValue(value);
      isFirstRender.current = false;
    }

    // Clear existing timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (maxTimeoutRef.current) {
      clearTimeout(maxTimeoutRef.current);
    }

    // Set up the debounce timeout
    timeoutRef.current = setTimeout(() => {
      if (trailing) {
        setDebouncedValue(value);
      }
    }, delay);

    // Set up the max delay timeout if specified
    if (maxDelay) {
      maxTimeoutRef.current = setTimeout(() => {
        setDebouncedValue(value);
      }, maxDelay);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (maxTimeoutRef.current) {
        clearTimeout(maxTimeoutRef.current);
      }
    };
  }, [value, delay, maxDelay, leading, trailing]);

  return debouncedValue;
}
