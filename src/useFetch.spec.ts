import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import { SynchronousPromise } from 'synchronous-promise'
import { MockResponseInit } from 'jest-fetch-mock'
import useFetch, { FetchState } from './useFetch'


describe('When fetch resolves with a json body', () => {

    let result: RenderHookResult<unknown, FetchState<any>>

    afterEach(() => {
        fetchMock.resetMocks()
    })

    describe('when the url is "https://jsonplaceholder.typicode.com/todos/1"', () => {
        beforeEach(async () => {
            result = renderHook(() => useFetch('https://jsonplaceholder.typicode.com/todos/1'))
            await result.waitForNextUpdate()
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
    })

    describe('when the result tries to perform prototype pollution', () => {
        beforeEach(async () => {
            fetchMock.doMock()
            fetchMock.mockResponse(() => Promise.resolve({
                body: JSON.stringify({
                    a: 1,
                    '__proto__': {
                        foo: 'pwned'
                    }
                }),
                init: {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            }))
            result = renderHook(() => useFetch('https://example.com'))
            await result.waitForNextUpdate()
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
    let result: RenderHookResult<unknown, FetchState<any>>


    beforeEach(async () => {
        fetchMock.doMock()
        fetchMock.mockResponse(() => Promise.resolve({
            body: 'Hello, world!',
            init: {
                status: 200,
                headers: { 'Content-Type': 'text/plain' }
            }
        }))

        result = renderHook(() => useFetch('https://example.com'))
        await result.waitForNextUpdate()
    })

    afterEach(() => {
        fetchMock.resetMocks()
    })

    it('should return the response body as text', async () => {
        const { data } = result.result.current
        expect(data).toBe('Hello, world!')
    })

    it('should set status to "success"', () => {
        expect(result.result.current.status).toBe('success')
    })
})

describe('When fetch returns an image', () => {
    let result: RenderHookResult<unknown, FetchState<any>>
    let actual: FetchState<any>

    beforeEach(async () => {
        fetchMock.dontMock()
        result = renderHook(() => useFetch('https://picsum.photos/200/300'))
        await result.waitForNextUpdate()
        actual = result.result.current
    })

    afterEach(() => {
        fetchMock.resetMocks()
    })


    it('data should be a blob', () => {
        // console.log(actual.data)
        expect(actual.data).toBeInstanceOf(Blob)
    })

    it('should set status to "success"', () => {
        expect(actual.status).toBe('success')
    })

    it('should set error to null', () => {
        expect(actual.error).toBeNull()
    })

})

describe('When the response is pending', () => {
    let result: RenderHookResult<unknown, FetchState<any>>
    let promise: SynchronousPromise<MockResponseInit>

    beforeEach(async () => {
        promise = SynchronousPromise.resolve({
            body: JSON.stringify({ foo: 'bar' }),
            init: {
                status: 200,
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        }).pause()

        fetchMock.doMock()
        fetchMock.mockResponse(() => promise)

        result = renderHook(() => useFetch('https://example.com'))
        // await result.waitForNextUpdate()
    })

    afterEach(() => {
        fetchMock.resetMocks()
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

    describe('when the response then resolves', () => {
        beforeEach(async () => {
            promise.resume()
            await result.waitForNextUpdate()
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
    })
})

describe('When fetch rejects', () => {
    let result: RenderHookResult<unknown, FetchState<any>>
    const error: Error = new Error('Something went wrong')
    const makeError = () => Promise.reject(error)


    beforeEach(async () => {
        fetchMock.doMock()
        // error = makeError()
        fetchMock.mockReject(makeError)

        result = renderHook(() => useFetch('https://example.com'))
        await result.waitForNextUpdate()
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