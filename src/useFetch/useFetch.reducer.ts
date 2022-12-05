import { useReducer, Reducer, useMemo } from 'react'
import type { RequestStatePending, RequestStateData } from './types'
import { bindActions, RequestActions } from './useFetch.actions'

const initialState: RequestStatePending = {
    status: 'pending',
    data: null,
    error: null,
}

function requestStateReducer<TData, TError>(
    state: RequestStateData<TData, TError>,
    action: RequestActions<TData, TError>
): RequestStateData<TData, TError> {
    switch (action.type) {
        case 'RESET':
        case 'START_REQUEST':
            if (state.status === 'pending') return state
            else return { ...initialState }

        case 'RECEIVE_RESPONSE':
            return {
                status: 'success',
                data: action.payload,
                error: null,
            }

        case 'RECEIVE_ERROR':
            return {
                status: 'error',
                data: null,
                error: action.payload,
            }
    }
}

export const useRequestState = <TData, TError>() => {
    const [state, dispatch] = useReducer<
        Reducer<RequestStateData<TData, TError>, RequestActions<TData, TError>>
    >(requestStateReducer, initialState)

    const actions = useMemo(() => bindActions(dispatch), [dispatch])
    return { state, actions }
}
