import { useRef } from 'react'
import deepEqual from './lib/deepEqual'

export type Compare<T> = (a: T, b: T) => boolean

/**
 * Similar to [useMemo], this hook memoizes an object by comparing it
 * with a {@link Compare comparison function}. This hook doesn't aim to
 * avoid expensive computation, rather it aims to provide a stable value
 * for a deeply nested object so that it can be used within a dependency
 * array.
 *
 * This hook was inspired by useHook's
 * [useMemoCompare][https://usehooks.com/useMemoCompare], but the
 * implementation is different.
 *
 * @param curr The current value of the object to memoize.
 * @param compare A function that compares the current value of the object.
 *        Defaults to {@link deepEqual}.
 *
 * @returns `curr` if it isn't equal to the previous value, otherwise
 *          the previous value.
 *
 * @see [useHooks - useMemoCompare](https://usehooks.com/useMemoCompare)
 */
export default function useMemoCompare<T>(
    curr: T,
    compare: Compare<T> = deepEqual
): T {
    const prev = useRef<T>(curr)

    // TODO: use useEffect w/ curr in dep array?
    if (prev.current === undefined || !compare(prev.current, curr)) {
        prev.current = curr
    }

    return prev.current
}
