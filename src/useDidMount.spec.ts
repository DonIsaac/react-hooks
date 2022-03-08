import { renderHook } from '@testing-library/react-hooks'
import useDidMount from './useDidMount'

describe('useMount', () => {
    it('should return false before the component mounts and true once it mounts', async () => {
        const hook = renderHook(() => useDidMount())
        // Returns false before the component mounts
        expect(hook.result.all[0]).toBe(false)

        hook.rerender()
        // Returns true after the component mounts
        expect(hook.result.current).toBe(true)
    })
})
