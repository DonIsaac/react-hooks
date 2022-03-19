/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    DependencyList,
    useCallback,
    useMemo,
    useEffect,
    useRef,
    useDebugValue,
} from 'react'
import { CancelablePromise, CancelablePromisify } from './lib/cancelablePromise'

/**
 * @private
 */
type Handle = number

/**
 * Delay Strategies control how callbacks are deferred. This array contains
 * 3 items:
 *
 * 1. The function that will request the callback. It returns a handle that
 *    can be used to cancel the callback.
 * 2. The function that cancels a currently pending callback using its handle
 * 3. The options that are passed to the request function. This is undefined
 *    for request functions that don't take options.
 *
 * @private
 */
type DelayStrategyArray<
    T extends (callback: () => void, ...args: any[]) => Handle,
    O = void
> = T extends (callback: () => void, opts?: infer P) => Handle
    ? [
          requestDelayedCallback: T,
          cancelDelayedCallback: (handle: Handle) => void,
          opts?: O extends void ? P : O
      ]
    : [
          requestDelayedCallback: T,
          cancelDelayedCallback: (handle: Handle) => void,
          opts: undefined
      ]

type DelayStrategies = {
    idle: DelayStrategyArray<typeof requestIdleCallback>
    animation: DelayStrategyArray<typeof requestAnimationFrame>
    timeout: DelayStrategyArray<typeof setTimeout>
    resolve: DelayStrategyArray<(cb: () => void, opts?: any) => Handle>
}
// export type DelayStrategy = 'idle' | 'animation' | 'timeout' | 'resolve'
export type DelayStrategy = keyof DelayStrategies

export interface DelayedCallbackOptions {
    /**
     * The delay strategy to use.
     *
     * - `idle`: Use the {@link requestIdleCallback} function.
     * - `animation`: Use the {@link requestAnimationFrame} function.
     * - `timeout`: Use the {@link setTimeout} function.
     * - `resolve`: Use the {@link Promise.resolve} function.
     *
     * @see {@link DelayStrategyArray}
     *
     * @see [MDN - requestIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback)
     * @see [MDN - requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
     * @see [MDN - setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/Window/setTimeout)
     * @see [MDN - Promise.resolve](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve)
     *
     * @default 'idle'
     */
    strategy?: DelayStrategy
    timeout?: number
}

/**
 * Wraps a callback function to delay its execution. This is a drop-in
 * replacement for {@link useCallback} that allows you to specify a delay
 * strategy.
 *
 * How long the callback is delayed for depends on the strategy. See
 * {@link DelayedCallbackOptions.strategy} for available strategies and their
 * behaviors.
 *
 * The new callback will always be asynchronous. The returned promise can be
 * canceled by using the {@link CancelablePromise.cancel} method.
 *
 * @param callback    The callback to decorate.
 * @param deps        Dependencies that, if changed, will cause the callback to
 *                    be updated.
 * @param options     Optional {@link DelayedCallbackOptions options object}.
 *
 * @returns A memoized, delayed version of `callback`.
 *
 * @see {@link CancelablePromise}
 */
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
    const [requestDelayedCallback, cancelDelayedCallback, opts] =
        useMemo(() => {
            const strategies: DelayStrategies = {
                // Use the `requestIdleCallback` function.
                idle: [requestIdleCallback, cancelIdleCallback, { timeout }],

                // Use the `requestAnimationFrame` function.
                animation: [
                    requestAnimationFrame,
                    cancelAnimationFrame,
                    undefined,
                ],

                // Use the `setTimeout` function.
                timeout: [setTimeout, clearTimeout, timeout],

                // Use the `Promise.resolve` function.
                // FIXME: This has no handle
                resolve: [
                    (cb: () => void, opts?: any): number => (
                        Promise.resolve().then(() => cb()), NaN
                    ),
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    (handle: Handle) => {}, // FIXME: this could be problematic
                    undefined,
                ],
            }

            return strategies[strategy]
        }, [strategy, timeout])

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
                }, opts) as Handle | undefined

                handle && cancelList.current.add(handle)
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
