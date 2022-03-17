import { useEffect } from 'react'

/**
 * Uses {@link setInterval} to repeatedly call `callback` every `delay`
 * milliseconds.
 *
 * @example
 * ```tsx
 * import { FC, useState, useEffect } from 'react'
 * import useInterval from 'react-hooks/useInterval'
 *
 * export const Timer: FC = () => {
 *     const [date, setDate] = useState(new Date())
 *
 *     // Update date every second
 *     useInterval(() => {
 *         setDate(new Date())
 *     }, 1000)
 *
 *     return (
 *         <span>
 *             {date.toLocaleTimeString()}
 *         </span>
 *     )
 * }
 * ```
 *
 * @param callback The callback to be called every `delay` milliseconds.
 * @param delay    How often to call `callback` in milliseconds.
 */
const useInterval = (callback: () => void, delay: number) => {
    useEffect(() => {
        const interval = setInterval(callback, delay)
        return () => clearInterval(interval)
    }, [delay, callback])
}

export default useInterval
