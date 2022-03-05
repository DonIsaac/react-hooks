/**
 * Status of an asynchronously executing task.
 */
export type RequestStatus = 'pending' | 'success' | 'error'

/**
 * Returned from `useFetch`.
 *
 * @template T the type of data the asynchronous task resolves to.
 */
export type FetchState<T> = {
    /**
     * The current status of the fetch request.
     */
    status: FetchStatus

    /**
     * The data payload parsed from the response. While pending, or if the
     * response returns unsuccessfully, this is `null`.
     */
    data: T | null

    /**
     * The response error on unsuccessful requests. If the request was successful
     * or is currently pending, this is `null`.
     */
    error: Error | null
}

export type RequestState<T, E = Error> =
    | RequestStatePending
    | RequestStateSuccess<T>
    | RequestStateError<E>

type RequestStatePending = {
    /**
     * The current status of the fetch request.
     */
    status: 'pending'

    /**
     * The data payload parsed from the response. While pending, or if the
     * response returns unsuccessfully, this is `null`.
     */
    data: null

    /**
     * The response error on unsuccessful requests. If the request was successful
     * or is currently pending, this is `null`.
     */
    error: null
}

type RequestStateError<E> = {
    /**
     * The current status of the fetch request.
     */
    status: 'error'

    /**
     * The data payload parsed from the response. While pending, or if the
     * response returns unsuccessfully, this is `null`.
     */
    data: null

    /**
     * The response error on unsuccessful requests. If the request was successful
     * or is currently pending, this is `null`.
     */
    error: E
}

type RequestStateSuccess<T> = {
    /**
     * The current status of the fetch request.
     */
    status: 'success'

    /**
     * The data payload parsed from the response. While pending, or if the
     * response returns unsuccessfully, this is `null`.
     */
    data: T

    /**
     * The response error on unsuccessful requests. If the request was successful
     * or is currently pending, this is `null`.
     */
    error: null
}
