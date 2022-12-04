import { render, renderHook, RenderHookResult } from '@testing-library/react'
import React from 'react'
import useMount from './useMount'

describe('useMount', () => {
    const cb = jest.fn()

    afterEach(() => {
        cb.mockReset()
    })

    it('should call the callback only when the component mounts', async () => {
        const hook = renderHook(() => useMount(cb))

        expect(cb).toHaveBeenCalledTimes(1)

        // The callback should not be called again when the component re-renders.
        hook.rerender()
        expect(cb).toHaveBeenCalledTimes(1)
    })
    it('in strict mode, should call the callback only when the component mounts', async () => {
        const Component = () => {
            useMount(cb)
            return null
        }
        const App = () => (
            <React.StrictMode>
                <Component />
            </React.StrictMode>
        )
        const view = render(<App />)

        expect(cb).toHaveBeenCalledTimes(1)

        // The callback should not be called again when the component re-renders.
        view.rerender(<App />)
        expect(cb).toHaveBeenCalledTimes(1)
    })
})
