import { useCallback, useState, useDebugValue, useMemo } from 'react'
import useFetch from './useFetch'
import { RequestState } from './useFetch'
import useMemoCompare from './useMemoCompare'

export interface UsePaginatedOptions {
    /**
     * @default 'page'
     */
    pageVarName?: string

    /**
     * @default 0
     */
    pageStart?: number

    /**
     * @default 0
     */
    minPage?: number

    limit?: number
}

export type PaginatedRequest<T, E = Error> = RequestState<T, E> & {
    nextPage: () => void
    prevPage: () => void
    setPage: (page: number) => void
}

export default function usePaginatedFetch<T, E = Error>(
    to:
        | string
        | ((currPage: number, limit?: number | undefined) => RequestInfo),
    options: UsePaginatedOptions = {}
): PaginatedRequest<T, E> {
    const { pageStart = 0, limit } = options
    const [page, setPage] = useState(pageStart)

    useDebugValue(`page: ${page}`)

    const info = useMemo((): RequestInfo => {
        if (typeof to === 'function') {
            return to(page, limit)
        }

        // } else if (typeof to === 'string') {
        const url = new URL(to)
        url.searchParams.set('page', String(page))
        limit != null && url.searchParams.set('limit', String(limit))
        return url.toString()
    }, [to, page, limit])
    const memoInfo = useMemoCompare(info)

    // Functions to move to the next or previous page. These cause for
    // the next page to be requested

    const nextPage = useCallback(
        function nextPage() {
            setPage(page => page + 1)
        },
        [setPage]
    )

    const prevPage = useCallback(
        function prevPage() {
            if (page > pageStart) {
                setPage(page - 1)
            }
        },
        [page, setPage, pageStart]
    )

    const result = useFetch<T, E>(memoInfo)
    // useEffect(() => {
    //     const sendRequest = async () => {
    //         if (!memoInfo) {
    //             return
    //         }

    //         try {
    //             const res = await fetch(memoInfo)

    //             // If the request fails, set the error object. Response may contain
    //             // error details - include them if available
    //             if (!res.ok) {
    //                 const errPayload: Record<string, unknown> = await parseBody(
    //                     res
    //                 )
    //                 const err = new Error(`${res.status}: ${res.statusText}`)
    //                 Object.assign(err, errPayload)
    //                 throw err
    //             } else {
    //                 // Request succeeds, parse the response and set the data object
    //                 const payload = await parseBody<T>(res)
    //                 setData(payload)
    //                 setStatus('success')
    //             }
    //         } catch (err) {
    //             setError(err as E)
    //             setStatus('error')
    //         }
    //     }

    //     sendRequest()
    //     // TODO add opts back.
    // }, [memoInfo])
    return { ...result, nextPage, prevPage, setPage }
}
