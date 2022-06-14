import { useRef } from 'react'
import deepEqual from './lib/deepEqual'

export type Compare<T> = (a: T, b: T) => boolean

// Shamelessly stolen from useHooks.com
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
