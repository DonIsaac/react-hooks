import { useRef, useEffect, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type useMemoCompare from './useMemoCompare'

/**
 * Similar in nature to {@link useMemoCompare}, this creates a function with a
 * stable memory reference from a callback that is potentially re-created
 * continuously.
 *
 * This allows you to put callback functions received from props into a
 * dependency array while avoiding unnecessary re-execution of hooks like
 * {@link useEffect}.
 *
 * @param callback The current value of the callback function.
 *
 * @returns A function that has the same behavior as {@link callback} while
 * maintaining the same object reference.
 */
export default function useStableCallback<F extends (...args: any) => any>(
    callback: F
): F {
    const currentCallback = useRef<F>(callback)

    useEffect(() => {
        currentCallback.current = callback
    }, [callback])

    const stableCallback = useCallback(
        (...args: Parameters<F>) => currentCallback.current(...(args as any[])),
        []
    ) as unknown as F

    return stableCallback
}
