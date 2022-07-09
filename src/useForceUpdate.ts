import { useState, useCallback } from 'react'

const MAX_STATE_VALUE = 100

/**
 * Forces a component to update.
 *
 * This is useful for forcing updates when deeply nested state changes occur.
 *
 * @example
 * ```tsx
 * import { FC, useRef, useEffect } from 'react
 * import { useForceUpdate } from '@donisaac/react-hooks'
 *
 * // Displays an update counter and a button to force an update. This is
 * // not exactly best practice, but it is a good example of how to use
 * // this hook.
 * const TestComponent: FC = () => {
 *     const forceUpdate = useForceUpdate()
 *     const updateCount = useRef(0)
 *
 *     // Increment the update counter on each rerender
 *     useEffect(() => {
 *        updateCount.current++
 *     })
 *
 *     return (
 *         <div>
 *             <span data-testid="update-count" id="update-count">
 *                 {updateCount.current}
 *             </span>
 *             <button onClick={forceUpdate}>Force Update</button>
 *         </div>
 *     )
 * }
 * ```
 *
 * @returns a function that forces a component to update
 */
export default function useForceUpdate(): () => void {
    const [_, setState] = useState(0)
    const forceUpdate = useCallback(
        () => setState(state => (state + 1) % MAX_STATE_VALUE),
        [setState]
    )

    return forceUpdate
}
