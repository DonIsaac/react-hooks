/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import {
    requestIdleCallback,
    animationFrame,
    timer,
    clock,
    promise,
} from '@shopify/jest-dom-mocks'
import { SynchronousPromise } from 'synchronous-promise'
import { CancelablePromise, CancelablePromisify } from './lib/types'
import useDelayedCallback from './useDelayedCallback'

describe('useDelayedCallback', () => {
    const cb = jest.fn(() => 'foo')
    // let delayed: CancelablePromisify<(...args: any[]) => any>
    let delayed: RenderHookResult<
        unknown,
        (...args: any[]) => CancelablePromise<any>
    >

    beforeEach(() => {
        requestIdleCallback.mock()
        animationFrame.mock()
        timer.mock()
        // promise.mock()
    })

    afterEach(() => {
        requestIdleCallback.restore()
        animationFrame.restore()
        timer.restore()
        // promise.restore()
        cb.mockClear()
    })

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

            it('the delayed callback should return a cancelable promise', () => {
                const result = delayedCb()
                expect(result).toBeInstanceOf(Promise)
                expect(result.cancel).toBeInstanceOf(Function)
            })

            it('when delayed is called, it returns a cancelable promise that resolves to whatever cb returns', async () => {
                testCase.run()
                const result = delayedCb()
                testCase.run()

                expect(await result).toBe('foo')
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

            it('the delayed function rejects with the error', () => {
                const result = delayedCb()
                testCase.run()

                return expect(result).rejects.toThrow(error)
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

            it('when delayed is called, it returns a cancelable promise that resolves to whatever cb returns', async () => {
                testCase.run()

                const actual = delayed.result.current()
                testCase.run()
                expect(await actual).toBe('foo')
            })

            // it('when cb throws, the delayed function rejects with the error', () => {
            //     const err = new Error('foo')
            //     cb.mockImplementationOnce(async () => {
            //         throw err
            //     })

            //     const result = delayed.result.current()
            //     testCase.run()

            //     return expect(result).rejects.toThrow(err)
            // })
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

            it('the delayed function rejects with the error', async () => {
                testCase.run()
                const res = delayedCb()
                testCase.run()

                try {
                    const awaitedRes = await res
                    fail(`res should have thrown, got ${awaitedRes}`)
                } catch (err) {
                    expect(err).toBe(error)
                }
                // return expect(() => res).rejects //.toThrow(error)
            })
        })

        // describe.each([
        //     ['synchronous', 'foo'],
        //     ['asynchronous', Promise.resolve('foo')],
        // ])('when provided a %s function', (type, ret) => {
        //     beforeEach(() => {
        //         // cb.mockImplementation(cbImpl)
        //         // delayed = renderHook(
        //         //     // prettier-ignore
        //         //     () => useDelayedCallback(cb, [], { strategy: 'timeout' })
        //         // )
        //     })

        //     it('should return a function', () => {
        //         expect(delayed.result.current).toBeInstanceOf(Function)
        //     })

        //     it('should not invoke the callback immediately', () => {
        //         expect(cb).not.toHaveBeenCalled()
        //     })

        //     it('when delayed is called, it returns a cancelable promise that resolves to whatever cb returns', () => {
        //         cb.mockReturnValueOnce(ret)
        //         const result = delayed.result.current()

        //         expect(result).toBeInstanceOf(Promise)
        //         expect(result.cancel).toBeInstanceOf(Function)

        //         // timer.runAllTimers()
        //         testCase.run()

        //         return expect(result).resolves.toBe(ret)
        //     })

        //     it('when cb throws, the delayed function rejects with the error', () => {
        //         const err = new Error('foo')
        //         cb.mockImplementationOnce(() => {
        //             throw err
        //         })

        //         const result = delayed.result.current('foo')
        //         testCase.run()

        //         return expect(result).rejects.toThrow(err)
        //     })
        // })
    })

    // describe('timer strategy', () => {
    //     beforeEach(() => {
    //         delayed = renderHook(
    //             // prettier-ignore
    //             () => useDelayedCallback(cb, [], { strategy: 'timeout' })
    //         )
    //     })

    //     it('returns a function', () => {
    //         expect(delayed.result.current).toBeInstanceOf(Function)
    //     })

    //     it('when delayed is called, it returns a cancelable promise that resolves to whatever cb returns', () => {
    //         // cb.mockReturnValueOnce('foo')
    //         const result = delayed.result.current('foo')

    //         expect(result).toBeInstanceOf(Promise)
    //         expect(result.cancel).toBeInstanceOf(Function)

    //         // timer.runAllTimers()
    //         timer.runAllTimers()

    //         return expect(result).resolves.toBe('foo')
    //     })

    //     it('when cb throws, the delayed function rejects with the error', () => {
    //         const err = new Error('foo')
    //         cb.mockImplementationOnce(() => {
    //             throw err
    //         })

    //         const result = delayed.result.current('foo')
    //         timer.runAllTimers()

    //         return expect(result).rejects.toThrow(err)
    //     })
    // })
})

// describe('when given a synchronous callback', () => {
//     beforeEach(() => {
//         delayed = renderHook(
//             // prettier-ignore
//             () => useDelayedCallback(cb, [], { strategy: 'timeout' })
//         )
//     })

//     it('should return a function', () => {
//         expect(delayed.result.current).toBeInstanceOf(Function)
//     })

//     it('should not invoke the callback immediately', () => {
//         expect(cb).not.toHaveBeenCalled()
//     })

//     it('when delayed is called, it returns a cancelable promise that resolves to whatever the callback returns', () => {
//         cb.mockReturnValueOnce('foo')
//         const result = delayed.result.current()

//         expect(result).toBeInstanceOf(Promise)
//         expect(result.cancel).toBeInstanceOf(Function)

//         timer.runAllTimers()

//         return expect(result).resolves.toBe('foo')
//     })

//     it('when cb throws, the delayed function rejects with the error', () => {
//         const err = new Error('foo')
//         cb.mockImplementationOnce(() => {
//             throw err
//         })

//         const result = delayed.result.current()
//         timer.runAllTimers()

//         return expect(result).rejects.toThrow(err)
//     })
// })

// describe('when using idle strategy', () => {
//     beforeEach(() => {
//         delayed = renderHook(
//             // prettier-ignore
//             () => useDelayedCallback(cb, [], { strategy: 'idle' })
//         )
//     })

//     it('should return a function', () => {
//         expect(delayed.result.current).toBeInstanceOf(Function)
//     })

//     it('should not invoke the callback immediately', () => {
//         expect(cb).not.toHaveBeenCalled()
//     })

//     it('when delayed is called, it returns a cancelable promise that resolves to whatever the callback returns', () => {
//         cb.mockReturnValueOnce('foo')
//         const result = delayed.result.current()

//         expect(result).toBeInstanceOf(Promise)
//         expect(result.cancel).toBeInstanceOf(Function)

//         requestIdleCallback.runIdleCallbacks()

//         return expect(result).resolves.toBe('foo')
//     })

//     it('when cb throws, the delayed function rejects with the error', () => {
//         const err = new Error('foo')
//         cb.mockImplementationOnce(() => {
//             throw err
//         })

//         const result = delayed.result.current()
//         requestIdleCallback.runIdleCallbacks()

//         return expect(result).rejects.toThrow(err)
//     })
// })
// describe.each([
//     jest.fn()
// ])
// })
