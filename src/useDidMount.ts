import { useState } from 'react'
import useMount from './useMount'

/**
 *
 * Similar to {@link useMount()}, except it returns a boolean that is set to
 * true when the component mounts instead of calling an effect function.
 *
 * @example
 *
 * ```tsx
 * import { FC } from 'react'
 * import useDidMount from 'react-hooks/useDidMount'
 *
 * export const MyComponent: FC = () => {
 *     const isMounted = useDidMount()
 *     return (
 *         <span>MyComponent {isMounted ? 'is' : 'is not'} mounted to the DOM</span>
 *     )
 * }
 * ```
 *
 * @returns `true` when the component mounts, `false` otherwise.
 */
const useDidMount = () => {
    const [isMounted, setIsMounted] = useState(false)

    useMount(() => {
        setIsMounted(true)
    })

    return isMounted
}

export default useDidMount
