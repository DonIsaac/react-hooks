import {
    renderHook,
    RenderHookResult,
    RenderResult,
    WaitForNextUpdateOptions,
    act,
} from '@testing-library/react-hooks'
import { SynchronousPromise } from 'synchronous-promise'
import { MockResponseInit } from 'jest-fetch-mock'
import useFetch from './useFetch'
import { RequestState } from '../types'

describe('useFetch', () => {
    const waitOptions: WaitForNextUpdateOptions = {
        timeout: 5000,
    }
    let result: RenderHookResult<unknown, RequestState<any>>

    beforeAll(() => {
        jest.setTimeout(10_000)
    })

    afterAll(() => {
        // Reset the timeout to the default
        jest.setTimeout(5000)
    })

    afterEach(() => {
        fetchMock.resetMocks()
        result?.unmount()
    })

    describe('When fetch resolves with a json body', () => {
        describe('when the url is "https://jsonplaceholder.typicode.com/todos/1"', () => {
            const url = 'https://jsonplaceholder.typicode.com/todos/1'

            beforeEach(async () => {
                result = renderHook(() => useFetch(url))
                await act(async () => {
                    await result.waitForNextUpdate(waitOptions)
                })
            })

            it('should parse and return the expected result', async () => {
                const { data } = result.result.current
                expect(data).toEqual({
                    userId: 1,
                    id: 1,
                    title: 'delectus aut autem',
                    completed: false,
                })
            })

            it('should set the status to "success"', () => {
                expect(result.result.current.status).toBe('success')
            })

            it('error should be null', () => {
                expect(result.result.current.error).toBeNull()
            })

            describe('when data is re-fetched', () => {
                beforeEach(() => {
                    act(() => {
                        result.result.current.refetch()
                    })
                })

                it('should re-set the request state', () => {
                    // act(() => {
                    //     result.result.current.refetch()
                    // })
                    const { status, data, error } = result.result.current
                    expect(status).toBe('pending')
                    expect(data).toBeNull()
                    expect(error).toBeNull()
                })

                it('should re-execute the request', () => {
                    // act(() => {
                    //     result.result.current.refetch()
                    // })
                    expect(fetchMock).toHaveBeenCalledTimes(2)
                    expect(fetchMock).toHaveBeenLastCalledWith(url, undefined)
                })

                it('after the request resolves, the state should be updated to success', async () => {
                    // act(() => {
                    // })
                    // await act(async () => {
                    //     result.result.current.refetch()
                    //     await result.waitForNextUpdate(waitOptions)
                    // })
                    await act(async () => {
                        await result.waitForNextUpdate(waitOptions)
                    })
                    const { status, data, error } = result.result.current
                    expect(status).toBe('success')
                    expect(data).toEqual(expect.anything())
                    expect(error).toBeNull()
                })
            })
        })

        describe('when the result tries to perform prototype pollution', () => {
            beforeEach(async () => {
                fetchMock.doMock()
                fetchMock.mockResponse(() =>
                    Promise.resolve({
                        body: JSON.stringify({
                            a: 1,
                            __proto__: {
                                foo: 'pwned',
                            },
                        }),
                        init: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    })
                )
                result = renderHook(() => useFetch('https://example.com'))
                await act(async () => {
                    await result.waitForNextUpdate(waitOptions)
                })
            })

            it('should set the status to "success"', () => {
                expect(result.result.current.status).toBe('success')
            })

            it('data should be an object', () => {
                const { data } = result.result.current
                expect(typeof data).toBe('object')
                expect(data).not.toBeNull()
                expect(data).not.toBeUndefined()
            })
            it('should include own properties from the response', () => {
                expect(result.result.current.data.a).toBe(1)
            })

            it('should not have polluted the response prototype', () => {
                const { data } = result.result.current
                expect(data.__proto__).toEqual({})
                expect(data.foo).toBeUndefined()
                // @ts-expect-error foo should not be defined
                expect(Object.prototype.foo).toBeUndefined()
            })

            it('error should be null', () => {
                expect(result.result.current.error).toBeNull()
            })
        })
    })

    describe('When fetch resolves with text', () => {
        beforeEach(async () => {
            fetchMock.doMock()
            fetchMock.mockResponse(() =>
                Promise.resolve({
                    body: 'Hello, world!',
                    init: {
                        status: 200,
                        headers: { 'Content-Type': 'text/plain' },
                    },
                })
            )

            result = renderHook(() => useFetch('https://example.com'))
            await result.waitForNextUpdate(waitOptions)
        })

        it('should return the response body as text', async () => {
            const { data } = result.result.current
            expect(data).toBe('Hello, world!')
        })

        it('should set status to "success"', () => {
            expect(result.result.current.status).toBe('success')
        })
        it('no error should be set', () => {
            expect(result.result.current.error).toBeNull()
        })
    })

    describe('When fetch returns an image', () => {
        let actual: RequestState<any>

        beforeEach(async () => {
            fetchMock.dontMock()
            result = renderHook(() => useFetch('https://picsum.photos/200/300'))
            await result.waitForNextUpdate(waitOptions)
            actual = result.result.current
        })

        it('data should be a blob', () => {
            expect(actual.data.constructor.name).toEqual('Blob')
        })

        it('should set status to "success"', () => {
            expect(actual.status).toBe('success')
        })

        it('should set error to null', () => {
            expect(actual.error).toBeNull()
        })
    })

    describe('When the response is pending', () => {
        let promise: SynchronousPromise<MockResponseInit>

        beforeEach(async () => {
            promise = SynchronousPromise.resolve({
                body: JSON.stringify({ foo: 'bar' }),
                init: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            }).pause()

            fetchMock.doMock()
            fetchMock.mockResponse(() => promise)

            result = renderHook(() => useFetch('https://example.com'))
            // await result.waitForNextUpdate()
        })

        it('should set status to "pending"', () => {
            expect(result.result.current.status).toBe('pending')
        })

        it('should set data to null', () => {
            expect(result.result.current.data).toBeNull()
        })

        it('should set error to null', () => {
            expect(result.result.current.error).toBeNull()
        })

        it('refetch should be a function', () => {
            expect(result.result.current.refetch).toBeInstanceOf(Function)
        })

        describe('when the response then resolves', () => {
            beforeEach(async () => {
                promise.resume()
                await result.waitForNextUpdate(waitOptions)
            })

            it('should set status to "success"', () => {
                expect(result.result.current.status).toBe('success')
            })

            it('should set data to the response body', () => {
                expect(result.result.current.data).toEqual({ foo: 'bar' })
            })

            it('should set error to null', () => {
                expect(result.result.current.error).toBeNull()
            })

            describe('when data is later re-fetched', () => {
                beforeEach(() => {
                    promise = SynchronousPromise.resolve({
                        // response has new data
                        body: JSON.stringify({ foo: 'bar', baz: 'bang' }),
                        init: {
                            status: 200,
                            headers: {
                                'Content-Type': 'application/json',
                            },
                        },
                    }).pause()

                    act(() => {
                        result.result.current.refetch()
                    })
                })

                it('the returned state should be reset to the pending state', () => {
                    expect(result.result.current.status).toBe('pending')
                    expect(result.result.current.data).toBeNull()
                    expect(result.result.current.error).toBeNull()
                })
                it('when the request resolves, should update to a successful state with the new data', async () => {
                    promise.resume()
                    await result.waitForNextUpdate(waitOptions)
                    expect(result.result.current.status).toBe('success')
                    expect(result.result.current.data).toEqual({
                        foo: 'bar',
                        baz: 'bang',
                    })
                    expect(result.result.current.error).toBeNull()
                })
            })
        })
    })

    describe('When fetch rejects', () => {
        const error: Error = new Error('Something went wrong')
        const makeError = () => Promise.reject(error)

        beforeEach(async () => {
            fetchMock.doMock()
            fetchMock.mockReject(makeError)

            result = renderHook(() => useFetch('https://example.com'))
            await result.waitForNextUpdate(waitOptions)
        })

        it('should set error to the thrown error', async () => {
            expect(result.result.current.error).toBe(error)
        })

        it('should set status to "error"', () => {
            expect(result.result.current.status).toBe('error')
        })

        it('should set data to null', () => {
            expect(result.result.current.data).toBeNull()
        })
    })

    describe.each([400, 404, 500])(
        'when the API returns with a %d status code',
        status => {
            type ExtraContextError = Error & { extraContext: string }
            let actual: RenderResult<RequestState<any, ExtraContextError>>

            const statusTextMap = {
                400: 'Bad Request',
                404: 'Not Found',
                500: 'Internal Server Error',
            }

            beforeEach(async () => {
                fetchMock.doMock(async () => ({
                    body: JSON.stringify({
                        message: 'Something went wrong',
                        extraContext: 'This is extra context',
                        __proto__: { foo: 'bar' },
                    }),
                    status,
                    statusText:
                        statusTextMap[status as keyof typeof statusTextMap],
                }))

                result = renderHook(() =>
                    useFetch<any, ExtraContextError>('https://example.com')
                )
                await result.waitForNextUpdate(waitOptions)
                actual = result.result as RenderResult<
                    RequestState<any, ExtraContextError>
                >
            })

            it('should set status to "error"', () => {
                expect(actual.current.status).toBe('error')
            })
            it('should set data to null', () => {
                expect(actual.current.data).toBeNull()
            })
            it('should set error to an Error', () => {
                expect(result.result.current.error).toBeInstanceOf(Error)
            })
            it.skip('should include extra context from the response body within the error', () => {
                const { data, error } = actual.current
                expect(data).toBeNull()
                expect(error?.extraContext).toBe('Something went wrong')
            })
            it('should prevent prototype pollution', () => {
                expect((actual.current.error as any).foo).toBeUndefined()
            })
        }
    )
})