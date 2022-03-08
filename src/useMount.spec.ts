import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import useMount from './useMount'

describe('useMount', () => {
    const cb = jest.fn()

    it('should call the callback only when the component mounts', async () => {
        const hook = renderHook(() => useMount(cb))

        expect(cb).toHaveBeenCalledTimes(1)

        // The callback should not be called again when the component re-renders.
        hook.rerender()
        expect(cb).toHaveBeenCalledTimes(1)
    })
})
