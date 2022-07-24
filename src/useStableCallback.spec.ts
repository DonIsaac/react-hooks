import useStableCallback from './useStableCallback'
import { renderHook, RenderHookResult } from '@testing-library/react-hooks'

describe('useStableCallback(callback)', () => {
    const cb1 = jest.fn<any, any>()
    const cb2 = jest.fn<any, any>()

    describe('when initially rendered with cb1', () => {
        let result: RenderHookResult<jest.Mock, jest.Mock>
        let returned: unknown

        beforeEach(() => {
            cb1.mockReturnValue(5)
            Object.defineProperty(cb1, 'name', {
                value: 'cb1',
            })
            cb2.mockReturnValue(true)
            Object.defineProperty(cb2, 'name', {
                value: 'cb2',
            })
            result = renderHook(curr => useStableCallback(curr), {
                initialProps: cb1,
            })
        })

        afterEach(() => {
            result.unmount()
            returned = undefined
            cb1.mockClear()
            cb2.mockClear()
        })

        it('passes parameters and return values to/from the callback', () => {
            const a = 'a'
            const b = [1, 2, 3]

            returned = result.result.current(a)
            expect(cb1).toBeCalledWith(a)
            expect(returned).toBe(5)

            cb1.mockReturnValueOnce(false)
            returned = result.result.current(b)
            expect(cb1).toBeCalledWith(b)
            expect(returned).toBe(false)
        })

        it('when re-rendered with cb2, it is used instead of cb1', () => {
            result.result.current()
            expect(cb1).toHaveBeenCalled()
            expect(cb2).not.toHaveBeenCalled()

            cb1.mockClear()
            result.rerender(cb2)
            // expect(Object.is(result.result.all[0], result.result.all[1])).toBe(
            //     true
            // )

            result.result.current()
            expect(cb1).not.toHaveBeenCalled()
            expect(cb2).toHaveBeenCalled()
        })

        it("when re-rendered with cb2, the stable callback's object reference does not change", () => {
            const id = Symbol.for('id')
            Object.defineProperty(result.result.current, 'identifier', {
                get: () => id,
            })
            result.rerender(cb2)
            const { all } = result.result
            expect(all).toHaveLength(2)

            const [renderWithCb1, renderWithCb2] = all
            expect(renderWithCb1).toHaveProperty('identifier', id)
            expect(renderWithCb2).toHaveProperty('identifier', id)
            expect(Object.is(renderWithCb1, renderWithCb2)).toBe(true)
        })
    })
})
