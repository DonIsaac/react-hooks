// export * from './useFetch/types'

import {
    default as useDelayedCallback,
    DelayedCallbackOptions,
    DelayStrategy,
} from './useDelayedCallback'
import { default as useDidMount } from './useDidMount'
import { default as useFetch } from './useFetch'
import { default as useForceUpdate } from './useForceUpdate'
import { default as useInterval } from './useInterval'
import { default as useLocalStorage } from './useLocalStorage'
import { default as useMeasuredCallback } from './useMeasuredCallback'
import { default as useMemoCompare } from './useMemoCompare'
import { default as useMount } from './useMount'
import {
    default as usePaginated,
    UsePaginatedOptions,
    PaginatedRequest,
} from './usePaginated'
import { RequestState, RequestStatus } from './types'

// Hooks
export {
    useDelayedCallback,
    useDidMount,
    useFetch,
    useForceUpdate,
    useInterval,
    useLocalStorage,
    useMeasuredCallback,
    useMemoCompare,
    useMount,
    usePaginated,
}

// Types
export type {
    // useDelayedCallback
    DelayedCallbackOptions,
    DelayStrategy,
    // usePaginated
    PaginatedRequest,
    UsePaginatedOptions,
    // useFetch
    RequestState,
    RequestStatus,
}
