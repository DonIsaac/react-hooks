/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import {
    requestIdleCallback,
    animationFrame,
    timer,
} from '@shopify/jest-dom-mocks'
// import { SynchronousPromise } from 'synchronous-promise'
import { CancelablePromise, CancelablePromisify } from './lib/cancelablePromise'
import useDelayedCallback from './useDelayedCallback'

describe('useDelayedCallback', () => {
    const cb = jest.fn(() => 'foo')
    let delayed: RenderHookResult<
        unknown,
        (...args: any[]) => CancelablePromise<any>
    >

    describe.each([
        {
            strategy: 'idle',
            // run:
            // requestIdleCallback.runIdleCallbacks.bind(requestIdleCallback),
            run: () => requestIdleCallback.runIdleCallbacks(),
        },
        // {
        //     strategy: 'animation',
        //     // run: animationFrame.runFrame.bind(animationFrame),
        //     run: () => animationFrame.runFrame(),
        // },
        {
            strategy: 'timeout',
            // run: timer.runAllTimers.bind(timer)
            run: () => timer.runAllTimers(),
        },
        // { strategy: 'resolve', run: promise.runPending.bind(promise) },
    ])('when using $strategy strategy', testCase => {
        beforeEach(() => {
            requestIdleCallback.mock()
            animationFrame.mock()
            timer.mock()
        })

        afterEach(() => {
            requestIdleCallback.restore()
            animationFrame.restore()
            timer.restore()
            cb.mockClear()
        })

        describe('when the cb is synchronous', () => {
            let delayedCb: CancelablePromisify<(...args: any[]) => any>
            beforeEach(() => {
                delayed = renderHook(
                    // prettier-ignore
                    () => useDelayedCallback(cb, [], { strategy: testCase.strategy as any, timeout: 0 })
                )

                delayedCb = delayed.result.current
            })

            afterEach(() => {
                delayed.unmount()
                delayedCb = undefined as any
            })

            it('should return a function', () => {
                expect(delayedCb).toBeInstanceOf(Function)
            })

            it('should not invoke the callback immediately', () => {
                expect(cb).not.toHaveBeenCalled()
            })

            describe('when the delayed callback is invoked', () => {
                let result: CancelablePromise<any>

                beforeEach(async () => {
                    result = delayedCb()
                    testCase.run()
                })

                it('the delayed callback should return a cancelable promise', () => {
                    expect(result).toBeInstanceOf(Promise)
                    expect(result.cancel).toBeInstanceOf(Function)
                })

                it('should invoke the callback', async () => {
                    expect(cb).toHaveBeenCalledTimes(1)
                })

                it('should return the result of the callback', async () => {
                    const resultAwaited = await result
                    expect(resultAwaited).toBe('foo')
                })
            })

            describe('when the delayed callback is invoked then canceled', () => {
                let result: CancelablePromise<any>

                beforeEach(async () => {
                    result = delayedCb()
                    result.cancel()
                    testCase.run()
                })

                it('should not invoke the callback', async () => {
                    expect(cb).toHaveBeenCalledTimes(0)
                })
            })
        })

        describe('when the cb is synchronous and throws', () => {
            const error = new Error('foo')
            const cbThrows = jest.fn(() => {
                throw error
            })
            let delayedCb: CancelablePromisify<(...args: any[]) => any>

            beforeEach(() => {
                delayed = renderHook(
                    // prettier-ignore
                    () => useDelayedCallback(cbThrows, [], { strategy: testCase.strategy as any, timeout: 0 })
                )
                delayedCb = delayed.result.current
            })

            afterEach(() => {
                delayed.unmount()
                cbThrows.mockClear()
                delayedCb = undefined as any
            })

            it('the delayed callback rejects with the error', () => {
                const result = delayedCb()
                testCase.run()

                return expect(result).rejects.toThrow(error)
            })

            it('when canceled, the delayed callback does not reject and does not invoke the underlying callback', () => {
                const result = delayedCb()
                // result.catch(err => fail(`should not reject: ${err}`))
                result.catch(err => {
                    throw new Error(`should not reject: ${err}`)
                })
                result.cancel()
                testCase.run()
                expect(cbThrows).not.toBeCalled()
            })
        })

        describe('when the cb is asynchronous', () => {
            let delayedCb: CancelablePromisify<(...args: any[]) => any>
            const asyncCb = jest.fn(() => Promise.resolve('foo'))

            beforeEach(() => {
                // cb = jest.fn(async () => 'foo')
                delayed = renderHook(
                    // prettier-ignore
                    () => useDelayedCallback(asyncCb, [], { strategy: testCase.strategy as any, timeout: 0 })
                )
                delayedCb = delayed.result.current
            })

            afterEach(() => {
                delayed.unmount()
                asyncCb.mockClear()
                delayedCb = undefined as any
            })

            it('should return a function', () => {
                expect(delayedCb).toBeInstanceOf(Function)
            })

            it('should not invoke the callback immediately', () => {
                expect(asyncCb).not.toHaveBeenCalled()
            })

            describe('when the delayed callback is invoked', () => {
                let result: CancelablePromise<any>
                let resultAwaited: any

                beforeEach(async () => {
                    result = delayedCb()
                    testCase.run()
                    resultAwaited = await result
                })

                it('the delayed callback should return a cancelable promise', () => {
                    expect(result).toBeInstanceOf(Promise)
                    expect(result.cancel).toBeInstanceOf(Function)
                })

                it('should invoke the callback', async () => {
                    expect(asyncCb).toHaveBeenCalledTimes(1)
                })

                it('should return the result of the callback', async () => {
                    expect(resultAwaited).toBe('foo')
                })
            })

            describe('when the delayed callback is invoked then canceled', () => {
                let result: CancelablePromise<any>

                beforeEach(() => {
                    result = delayedCb()
                    result.cancel()
                    testCase.run()
                })

                it('should not invoke the callback', async () => {
                    expect(cb).toHaveBeenCalledTimes(0)
                })
            })
        })

        describe('when the cb is async and throws', () => {
            const error = new Error('foo')
            const cbAsyncThrows = jest.fn(async () => {
                throw error
            })
            let delayedCb: CancelablePromisify<(...args: any[]) => any>

            beforeEach(() => {
                delayed = renderHook(
                    // prettier-ignore
                    () => useDelayedCallback(cbAsyncThrows, [], { strategy: testCase.strategy as any, timeout: 0 })
                )
                delayedCb = delayed.result.current
            })

            afterEach(() => {
                delayed.unmount()
                cbAsyncThrows.mockClear()
                delayedCb = undefined as any
            })

            it('the delayed function rejects with the error', () => {
                testCase.run()
                const res = delayedCb()
                testCase.run()

                return expect(res).rejects.toThrow(error)
            })

            it('when canceled, does not reject nor invoke the underlying callback', () => {
                testCase.run()
                const res = delayedCb()
                res.catch(err => {
                    throw new Error(
                        `Canceled promise should not have rejected, got ${err}`
                    )
                })
                res.cancel()
                testCase.run()

                expect(cbAsyncThrows).not.toBeCalled()
            })
        })
    })
})
