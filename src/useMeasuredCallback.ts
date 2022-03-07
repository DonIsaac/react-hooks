import { useCallback, DependencyList } from 'react'

export default function useMeasuredCallback<T extends (...args: any[]) => any>(
    callback: T,
    deps: DependencyList,
    onMeasure?: (measure: PerformanceMeasure) => void
) {
    const measuredCallback: T = useCallback(
        function measuredCallback(...args) {
            const startName = `${callback.name}-start`
            const endName = `${callback.name}-end`

            performance.mark(startName)
            const res = callback(...args)

            if (res instanceof Promise) {
                return res.then(resolved => {
                    performance.mark(endName)
                    const measure = performance.measure(
                        callback.name,
                        startName,
                        endName
                    )
                    onMeasure?.(measure)

                    return resolved
                })
            } else {
                performance.mark(endName)
                const measure = performance.measure(
                    callback.name,
                    startName,
                    endName
                )
                onMeasure?.(measure)
                return res
            }
        } as T,
        [...deps, onMeasure]
    )

    return measuredCallback
}
