import { useRef, useEffect } from 'react'

export type Compare<T> = (a: T, b: T) => boolean

// Shamelessly stolen from useHooks.com
export default function useMemoCompare<T>(
    curr: T,
    compare: Compare<T> = Object.is
): T {
    const prev = useRef<T>(curr)

    // useEffect(() => {
    if (prev.current === undefined || !compare(prev.current, curr)) {
        prev.current = curr
    }
    // })

    return prev.current
}
