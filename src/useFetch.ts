import { useState, useEffect } from 'react'
import { RequestState, RequestStatus } from './types'

export type { RequestState, RequestStatus }

/**
 * Sends a {@link fetch} request to a URL.
 *
 * @param url  The URL to send the request to.
 * @param opts Additional request options to pass to `fetch`.
 *
 * The request can be in one of three states: `pending`, `success`, and `error`.
 * The current state is made available from the `status` property on the
 * returned {@link RequestState} object.
 *
 * Before a response is received, the request is `pending`. Both `data` and
 * `error` are `null`. If the response has a successful status code and parsing
 * the payload is successful, `data` is set to the parsed payload and `status`
 * is set to `success`. If the response has a non-successful status code or
 * parsing the payload fails, an error object describing what went wrong is
 * stored in `error` and `status` is set to `error`.
 *
 * @template T The type of data received from the response payload.
 * @template E The type of error object received from the response payload.
 * Defaults to {@link Error}.
 *
 * @returns An object containing the request status, response data (on success),
 * and response error (on error).
 *
 * @see {@link RequestState}
 * @see
 * {@link https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API MDN Fetch API}
 */
export default function useFetch<T = any, E = Error>(
    url: string,
    opts?: RequestInit
): RequestState<T, E> {
    const [data, setData] = useState<T | null>(null)
    const [error, setError] = useState<E | null>(null)
    const [status, setStatus] = useState<RequestStatus>('pending')

    useEffect(() => {
        const sendRequest = async () => {
            if (url === '') {
                return
            }

            try {
                const res = await fetch(url, opts)

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
    }, [url])
    return { status, data, error } as RequestState<T, E>
}

async function parseBody<T>(res: Response): Promise<T> {
    try {
        const contentType = res.headers.get('Content-Type') ?? ''
        if (!contentType.length || contentType.includes('application/json')) {
            return res.json()
        } else if (contentType.includes('text')) {
            return res.text() as unknown as T
        } else {
            return res.blob() as unknown as T
        }
    } catch (err) {
        return res.text() as unknown as T
    }
}
