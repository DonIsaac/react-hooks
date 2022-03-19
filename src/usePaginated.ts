import { useCallback, useEffect, useState, useDebugValue } from 'react'
import useFetch from './useFetch'
import { RequestState, RequestStatus } from './types'
import { parseBody } from './lib/parseBody'

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
}

export default function usePaginatedFetch<T, E = Error>(
    to:
        | RequestInfo
        | ((currPage: number, limit?: number | undefined) => RequestInfo),
    options: UsePaginatedOptions = {}
) {
    const { pageStart = 0 } = options
    const [page, setPage] = useState(pageStart)
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<E | null>(null)
    const [status, setStatus] = useState<RequestStatus>('pending')
    useDebugValue(`page: ${page}`)

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

    useEffect(() => {
        const sendRequest = async (input: RequestInfo) => {
            if (!input) {
                return
            }

            try {
                const res = await fetch(input)

                // If the request fails, set the error object. Response may contain
                // error details - include them if available
                if (!res.ok) {
                    const errPayload: Record<string, unknown> = await parseBody(
                        res
                    )
                    const err = new Error(`${res.status}: ${res.statusText}`)
                    Object.assign(err, errPayload)
                    throw err
                } else {
                    // Request succeeds, parse the response and set the data object
                    const payload = await parseBody<T>(res)
                    setData(payload)
                    setStatus('success')
                }
            } catch (err) {
                setError(err as E)
                setStatus('error')
            }
        }

        sendRequest()
        // TODO add opts back.
    })
    return { nextPage, prevPage, setPage }
}
