import { EffectCallback, useEffect, useRef } from 'react'

/**
 * Similar to {@link useEffect}, but `effect` is only called once after the
 * component has completed its initial render and has been mounted to the DOM.
 * You can think of this as the hook version of `componentDidMount()`.
 *
 * @example
 * ```tsx
 * import { FC } from 'react'
 * import useMount from 'react-hooks/useMount'
 *
 * export const MyComponent: FC = () => {
 *     useMount(() => {
 *         console.log('component has been mounted to the DOM')
 *
 *         return () => console.log('component has been unmounted from the DOM')
 *     })
 *
 *     return <div />
 * }
 * ```
 *
 * @param effect The effect to be called after the component has been mounted to
 *              the DOM.
 */
const useMount = (effect: EffectCallback) => {
    // NOTE: After React 18, effects rendered in strict mode will be invoked
    // twice. This ref ensures effect is only ever called once.
    const mounted = useRef(false)
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true
            return effect()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
}

export default useMount
