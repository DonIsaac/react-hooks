import type { Dispatch } from 'react'

export const reset = () => ({
    type: 'RESET' as const,
})

export const startRequest = () => ({
    type: 'START_REQUEST' as const,
})

export const receiveResponse = <T>(data: T) => ({
    type: 'RECEIVE_RESPONSE' as const,
    payload: data,
})

export const receiveError = <E>(error: E) => ({
    type: 'RECEIVE_ERROR' as const,
    payload: error,
})

export type RequestActions<T, E> =
    | ReturnType<typeof reset>
    | ReturnType<typeof startRequest>
    | ReturnType<typeof receiveResponse<T>>
    | ReturnType<typeof receiveError<E>>

export const bindActions = <T, E>(
    dispatch: Dispatch<RequestActions<T, E>>
) => ({
    reset: () => dispatch(reset()),
    startRequest: () => dispatch(startRequest()),
    receiveResponse: (data: T) => dispatch(receiveResponse(data)),
    receiveError: (error: E) => dispatch(receiveError(error)),
})
