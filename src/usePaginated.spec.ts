/// <reference types="jest-fetch-mock" />
import { renderHook, RenderHookResult, act } from '@testing-library/react-hooks'
import usePaginated, { PaginatedRequest } from './usePaginated'

describe('usePaginated(to, options)', () => {
    afterEach(() => {
        fetchMock.resetMocks()
    })

    describe('with a url', () => {
        const url = 'https://example.com'
        let result: RenderHookResult<unknown, PaginatedRequest<unknown>>

        beforeEach(async () => {
            fetchMock.doMock()
            result = renderHook(() => usePaginated(url))
            await result.waitForNextUpdate()
        })

        it('sends a request using query parameters', async () => {
            expect(fetchMock).toBeCalledWith(`${url}/?page=0`, undefined)
        })

        it.failing(
            'should fetch the next/prev page when nextPage() then prevPage() are called',
            async () => {
                act(() => {
                    result.result.current.nextPage()
                })
                await result.waitForNextUpdate()
                expect(fetchMock).toBeCalledWith(`${url}/?page=1`, undefined)

                act(() => {
                    result.result.current.prevPage()
                })
                await result.waitForNextUpdate()
                expect(fetchMock).toBeCalledWith(`${url}/?page=0`, undefined)
            }
        )

        it('prevPage() should not decrement the page number past `pageStart`', async () => {
            act(() => {
                result.result.current.prevPage()
            })
            // await result.waitForNextUpdate({ timeout: 100 })
            expect(fetchMock).toBeCalledWith(`${url}/?page=0`, undefined)
        })
    })

    describe('with a function returning a url', () => {
        const to = jest.fn(
            (page, limit) => `https://foo.com/bar/?p=${page}&l=${limit}`
        )
        let result: RenderHookResult<unknown, PaginatedRequest<unknown>>

        beforeEach(async () => {
            fetchMock.doMock()
            result = renderHook(() => usePaginated(to))
            await result.waitForNextUpdate()
        })

        it('the to function should be called with the page number and no limit', () => {
            expect(to).toBeCalledWith(0, undefined)
        })

        it('should fetch the returned url', () => {
            expect(fetchMock).toBeCalledWith(
                'https://foo.com/bar/?p=0&l=undefined',
                undefined
            )
        })
    })
})
