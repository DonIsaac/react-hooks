/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    DependencyList,
    useCallback,
    useMemo,
    useEffect,
    useRef,
    useDebugValue,
} from 'react'
import { CancelablePromise, CancelablePromisify } from './lib/types'

/**
 * @private
 */
type Handle = number
type DelayStrategyArray<T extends (...args: any) => Handle> = T extends (
    callback: () => void,
    opts?: infer P
) => Handle
    ? [
          requestDelayedCallback: T,
          cancelDelayedCallback: (handle: Handle) => void,
          opts?: P
      ]
    : [
          requestDelayedCallback: T,
          cancelDelayedCallback: (handle: Handle) => void,
          opts: undefined
      ]

export interface DelayedCallbackOptions {
    strategy?: 'idle' | 'animation' | 'timeout' | 'resolve'
    timeout?: number
}

const useDelayedCallback = <T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList,
    options: DelayedCallbackOptions = {}
) => {
    const { strategy = 'idle', timeout } = options
    const cancelList = useRef<Set<Handle>>(new Set())
    useDebugValue(cancelList.current.size, value => `${value} active handles`)

    // Get the functions that will invoke and cancel the callback.
    // Which exact functions are used depends on the strategy.
    const [requestDelayedCallback, cancelDelayedCallback, opts] = useMemo(
        () =>
            ({
                idle: [
                    requestIdleCallback,
                    cancelIdleCallback,
                    { timeout },
                ] as DelayStrategyArray<typeof requestIdleCallback>,

                animation: [
                    requestAnimationFrame,
                    cancelAnimationFrame,
                    undefined,
                ] as DelayStrategyArray<typeof requestAnimationFrame>,

                timeout: [
                    setTimeout,
                    clearTimeout,
                    timeout,
                ] as DelayStrategyArray<typeof setTimeout>,

                // FIXME: This has no handle
                resolve: [
                    (cb: () => void) => Promise.resolve().then(() => cb()),
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    () => {}, // FIXME: this could be problematic
                    undefined,
                ],
            }[strategy] as [
                (callback: () => void, opts?: Record<string, any>) => Handle,
                (handle: Handle) => void,
                any
            ]),
        [strategy, timeout]
    )

    // Create the delayed callback.
    const delayedCallback = useCallback<CancelablePromisify<T>>(
        function makeDelayedCallback(...args: any[]) {
            /** Handle number used to identify the callback for cancellation. */
            let handle: Handle | undefined

            const promise = new Promise<ReturnType<T>>((resolve, reject) => {
                handle = requestDelayedCallback(async () => {
                    try {
                        const result = await callback(...args)
                        resolve(result)
                    } catch (error) {
                        reject(error)
                    } finally {
                        // TODO: Should this be called before
                        // resolve/reject?
                        // NOTE: handle could be 0
                        handle != null && cancelList.current.delete(handle)
                    }
                }, opts)

                cancelList.current.add(handle)
            })

            ;(promise as CancelablePromise<ReturnType<T>>).cancel = () => {
                // NOTE: handle could be 0
                if (handle != null) {
                    cancelDelayedCallback(handle)
                    cancelList.current.delete(handle)
                }
            }

            return promise as CancelablePromise<ReturnType<T>>
        } as CancelablePromisify<T>,
        [...deps, callback, requestDelayedCallback, cancelDelayedCallback]
    )

    // Adjust the callback's name to something more readable.
    useEffect(() => {
        Object.defineProperty(delayedCallback, 'name', {
            value: `delayed(${callback.name})`,
        })
    }, [delayedCallback])

    // Cancel all pending callbacks when the component unmounts.
    useEffect(
        () => () => cancelList.current.forEach(cancelDelayedCallback),
        [cancelDelayedCallback]
    )

    return delayedCallback
}

export default useDelayedCallback
