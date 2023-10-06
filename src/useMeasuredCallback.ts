import { useCallback, DependencyList } from 'react'

/**
 * Similar to
 * [useCallback()](https://reactjs.org/docs/hooks-reference.html#usecallback),
 * this hook returns a memoized callback whose execution time is recorded.
 *
 * When the returned callback is called, the `onMeasure` callback is invoked
 * with the amount of time it took to run. Execution times are also displayed in
 * the DevTools Performance Timeline. This lets you monitor time-consuming
 * operations.
 *
 * @example
 * ```tsx
 * import { FC, useCallback, useEffect } from 'react'
 * import useMeasuredCallback from 'react-hooks/useMeasuredCallback'
 * import intensiveTask from './intensiveTask'
 *
 * export const MyComponent: FC<{ logger?: typeof Console }> = ({
 *     logger = console
 * }) => {
 *     const [result, setResult] = useState<ReturnType<typeof intensiveTask> | undefined>(undefined)
 *
 *     const onMeasure = useCallback((measure: PerformanceMeasure) => {
 *         logger.log(`intensive task took ${measure.duration} ms to run`)
 *     })
 *
 *     const measuredIntensiveTask = useMeasuredCallback(
 *         intensiveTask,
 *         [],
 *         onMeasure
 *     )
 *
 *     // Only call the function when needed (it takes a while to run!)
 *     useEffect(() => {
 *         setResult(measuredIntensiveTask())
 *     }, [measuredIntensiveTask])
 *
 *     return <div>{result}</div>
 * }
 * ```
 *
 * @param callback  The callback being measured.
 * @param deps      Dependencies that, if changed, will cause the callback to be
 *                  updated.
 * @param onMeasure An optional callback that is called with the measured
 *                  performance measure when the callback is executed.
 *
 * @returns       A memoized, measured version of `callback`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function useMeasuredCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList,
    onMeasure?: (measure: PerformanceMeasure) => void
) {
    const measuredCallback: T = useCallback<T>(
        function measuredCallback(...args) {
            const startName = `${callback.name}-start`
            const endName = `${callback.name}-end`

            const endMeasure = <U>(value: U) => {
                performance.mark(endName)
                const measure = performance.measure(
                    callback.name,
                    startName,
                    endName
                )
                onMeasure?.(measure)
                return value
            }

            performance.mark(startName)
            const res = callback(...args)

            if (res instanceof Promise) {
                return res.then(endMeasure)
            } else {
                return endMeasure(res)
            }
        } as T,
        [...deps, onMeasure]
    )

    return measuredCallback
}
