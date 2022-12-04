import { renderHook, RenderHookResult, act } from '@testing-library/react-hooks'
import { MockResponseInit } from 'jest-fetch-mock'
import useFetch from '../useFetch'
import { RequestState } from '../../types'

describe('useFetch error handling', () => {
    beforeAll(() => {
        fetchMock.doMock()
    })

    afterEach(() => {
        fetchMock.resetMocks()
    })

    afterAll(() => {
        fetchMock.dontMock()
    })

    describe.each([400, 404, 500])(
        'when the request fails with a %d error',
        errorCode => {
            const statusTextMap = {
                400: 'Bad Request',
                404: 'Not Found',
                500: 'Internal Server Error',
            }

            describe('when the error response is json', () => {
                let result: RenderHookResult<unknown, RequestState<any>>
                let state: RequestState<any>
                const error = {
                    error: 'Internal Server Error',
                    context: 'test',
                    __proto__: { foo: 'bar' },
                }

                beforeEach(async () => {
                    fetchMock.mockResponse(() =>
                        Promise.resolve({
                            body: JSON.stringify(error),
                            status: errorCode,
                            init: {
                                status: errorCode,
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                            },
                        })
                    )
                    result = renderHook(() => useFetch('http://localhost'))
                    await act(async () => {
                        await result.waitForNextUpdate()
                    })
                    state = result.result.current
                })

                it('the state is in an error state', () => {
                    expect(state.status).toBe('error')
                    expect(state.data).toBeNull()
                    expect(state.error).toBeInstanceOf(Error)
                })

                it('error data from the response body is merged with the error', () => {
                    const actual = state.error as Error & typeof error
                    expect(actual.error).toBe(error.error)
                    expect(actual.context).toBe(error.context)
                })

                it('should prevent prototype pollution', () => {
                    const actual = state.error as Error & Record<string, any>
                    expect(actual.foo).toBeUndefined()
                })
            })

            it('when the error response has no content type or body, the error from the request state is a normal error', async () => {
                fetchMock.mockResponse(() =>
                    Promise.resolve({
                        body: '',
                        status: errorCode,
                        init: {
                            status: errorCode,
                            headers: {},
                        },
                    })
                )
                const { result, waitForNextUpdate } = renderHook(() =>
                    useFetch('http://localhost')
                )
                expect(result.current.status).toBe('pending')
                await act(() => waitForNextUpdate())
                expect(result.current.status).toBe('error')
                expect(result.current.error).toBeInstanceOf(Error)
                expect(typeof result.current.error?.message).toBe('string')
                expect(result.current.data).toBeNull()
            })

            describe('when the error response is short text', () => {
                let result: RenderHookResult<unknown, RequestState<any>>
                let state: RequestState<any>

                const errorMessage = 'An error occurred'

                beforeEach(async () => {
                    // fetchMock.mockResponse(() => Promise.resolve()JSON.stringify(response))
                    fetchMock.mockResponse(() =>
                        Promise.resolve<MockResponseInit>({
                            body: errorMessage,
                            init: {
                                status: errorCode,
                                headers: {
                                    'Content-Type': 'text/plain',
                                },
                            },
                        })
                    )
                    result = renderHook(() => useFetch('http://localhost'))
                    await act(async () => {
                        await result.waitForNextUpdate()
                    })
                    state = result.result.current
                })

                it('the request state is in an error state', () => {
                    expect(state.status).toBe('error')
                    expect(state.data).toBeNull()
                    expect(state.error).toBeDefined()
                })

                it('the error is an Error instance', () => {
                    expect(state.error).toBeInstanceOf(Error)
                })

                it('the error message contains the status code', () => {
                    expect(state.error?.message).toContain(errorCode.toString())
                })

                it('the error message contains the error text', () => {
                    expect(state.error?.message).toContain(errorMessage)
                })
                it('the error object stores the response text in the "error" property', () => {
                    expect(
                        (state.error as Error & Record<string, unknown>)?.error
                    ).toBe(errorMessage)
                })
            })

            describe('when the error response is long text', () => {
                let result: RenderHookResult<unknown, RequestState<any>>
                let state: RequestState<any>

                const errorMessage = 'x'.repeat(1000)

                beforeAll(async () => {
                    // fetchMock.mockResponse(() => Promise.resolve()JSON.stringify(response))
                    fetchMock.mockResponse(() =>
                        Promise.resolve<MockResponseInit>({
                            body: errorMessage,
                            init: {
                                status: errorCode,
                                headers: {
                                    'Content-Type': 'text/html',
                                },
                            },
                        })
                    )
                    result = renderHook(() => useFetch('http://localhost'))
                    await act(async () => {
                        await result.waitForNextUpdate()
                    })
                    state = result.result.current
                })

                it('the request state is in an error state', () => {
                    expect(state.status).toBe('error')
                    expect(state.data).toBeNull()
                    expect(state.error).toBeDefined()
                })

                it('the error is an Error instance', () => {
                    expect(state.error).toBeInstanceOf(Error)
                })

                it('the error message contains the status code', () => {
                    expect(state.error?.message).toContain(errorCode.toString())
                })

                it('the error message does not contain the error text', () => {
                    expect(state.error?.message).not.toContain(errorMessage)
                })

                it('the error object stores the response text in the "error" property', () => {
                    expect(
                        (state.error as Error & Record<string, unknown>)?.error
                    ).toBe(errorMessage)
                })
            })
        }
    )
})
