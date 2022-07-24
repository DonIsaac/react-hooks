import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import { sleep } from './lib/util'
import useMeasuredCallback from './useMeasuredCallback'

describe('useMeasuredCallback(cb, deps, onMeasure)', () => {
    const onMeasure = jest.fn()
    let callback: jest.Mock<unknown>
    let result: RenderHookResult<unknown, (...args: any[]) => unknown>

    beforeEach(() => {
        result = renderHook(() => useMeasuredCallback(callback, [], onMeasure))
    })

    afterEach(() => {
        result.unmount()
        onMeasure.mockClear()
        callback?.mockClear()
    })

    describe('given a callback that returns a string', () => {
        beforeAll(() => {
            callback = jest.fn(() => 'foo')
        })

        afterAll(() => {
            callback = undefined as any
        })

        it('returns a function', () => {
            expect(result.result.current).toBeInstanceOf(Function)
        })

        describe('when the returned function is called', () => {
            let returnedValue: string

            beforeEach(() => {
                returnedValue = result.result.current(1, 'foo') as string
            })

            it('passes the arguments to the callback', () => {
                expect(callback).toHaveBeenCalledWith(1, 'foo')
            })

            it('returns the callback return value', () => {
                expect(returnedValue).toBe('foo')
            })

            it('invokes onMeasure with the captured PerformanceMeasure object', () => {
                expect(onMeasure).toHaveBeenCalledWith(
                    expect.objectContaining({
                        duration: expect.any(Number),
                        entryType: 'measure',
                        name: expect.any(String),
                        startTime: expect.any(Number),
                    })
                )
            })
        })
    })

    describe('given a callback that returns a promise that resolves to a string', () => {
        beforeAll(() => {
            callback = jest.fn(() => sleep(50).then(() => 'foo'))
        })

        afterAll(() => {
            callback = undefined as any
        })

        it('returns a function', () => {
            expect(result.result.current).toBeInstanceOf(Function)
        })

        describe('when the returned function is called', () => {
            let returnedValue: Promise<string>

            beforeEach(() => {
                returnedValue = result.result.current(
                    1,
                    'foo'
                ) as Promise<string>
            })

            it('passes the arguments to the callback', () => {
                expect(callback).toHaveBeenCalledWith(1, 'foo')
            })

            it('returns the callback return value', async () => {
                expect(returnedValue).toBeInstanceOf(Promise)
                const awaitedReturnedValue = await returnedValue
                expect(awaitedReturnedValue).toBe('foo')
            })

            it('invoked onMeasure once the promise resolves', async () => {
                expect(onMeasure).not.toHaveBeenCalled()
                await returnedValue
                expect(onMeasure).toHaveBeenCalled()
            })
        })
    })
})
