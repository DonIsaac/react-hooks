import { EffectCallback, useEffect } from 'react'

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
    useEffect(effect, [])
}

export default useMount
