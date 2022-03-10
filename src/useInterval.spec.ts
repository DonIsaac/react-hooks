import { renderHook, RenderHookResult } from '@testing-library/react-hooks'

import {
    // requestIdleCallback,
    // animationFrame,
    // timer,
    clock,
    // promise,
} from '@shopify/jest-dom-mocks'

import useInterval from './useInterval'

describe('useInterval(cb, delay)', () => {
    beforeEach(() => {
        clock.mock()
    })

    afterEach(() => {
        clock.restore()
    })

    it('should call the callback every delay milliseconds', () => {
        const cb = jest.fn()
        const { rerender } = renderHook(() => useInterval(cb, 1000))

        rerender()
        expect(cb).toHaveBeenCalledTimes(0)

        clock.tick(1000)
        expect(cb).toHaveBeenCalledTimes(1)

        clock.tick(1000)
        expect(cb).toHaveBeenCalledTimes(2)

        rerender()
        expect(cb).toHaveBeenCalledTimes(2)

        clock.tick(500)
        expect(cb).toHaveBeenCalledTimes(2)

        clock.tick(500)
        expect(cb).toHaveBeenCalledTimes(3)
    })
})
