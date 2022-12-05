/**
 * Status of an asynchronously executing task.
 */
export type RequestStatus = 'pending' | 'success' | 'error'

export type RequestState<T, E = Error> = RequestCallbacks & RequestStateData<T, E>

export type RequestCallbacks = {
    /**
     * Manually re-execute the request.
     *
     * The request status gets reset to `pending` and the request is executed
     * again.  Useful for user-based refreshing.
     */
    refetch: () => void
}

export type RequestStateData<T, E> =
    | RequestStatePending
    | RequestStateSuccess<T>
    | RequestStateError<E>

export type RequestStatePending = {
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

/**
 * @template E The type of error received from the response payload.
 */
export type RequestStateError<E> = {
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

/**
 * @template T The type of data received from the response payload.
 */
export type RequestStateSuccess<T> = {
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
