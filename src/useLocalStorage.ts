import { useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { canUseDOM } from './lib/util'

export type UseLocalStorage = {
    /**
     * Similar to `useState`, but values are persisted in the browser's local
     * storage.
     *
     * When state is updated using the returned setter, the new value is saved to
     * local storage under the given `key`. Setting the value to `undefined` will
     * remove it from local storage. Local storage updates are performed lazily to
     * prevent blocking the main rendering thread.
     *
     * During the initial render, if a value is stored in local storage under the
     * given key, that value will be used as the initial state. Otherwise, the
     * state will be undefined.
     *
     * @param key - The key to store values under in local storage.
     * @returns A tuple containing a stateful value and a setter function, identical
     * to the return value of {@link useState}.
     *
     * @template T - The type of the stateful value.
     *
     * @see {@link localStorage}
     * @see {@link useState}
     */
    <T>(key: string): [T | undefined, Dispatch<SetStateAction<T | undefined>>]

    /**
     * Similar to `useState`, but values are persisted in the browser's local
     * storage.
     *
     * When state is updated using the returned setter, the new value is saved to
     * local storage under the given `key`. Setting the value to `undefined` will
     * remove it from local storage. Local storage updates are performed lazily to
     * prevent blocking the main rendering thread.
     *
     * If provided, the initial state parameter will be used as the state's
     * starting value. Otherwise existing data persisted in local storage will
     * be used. If neither are available, the state will be `undefined`.
     *
     * @param key - The key to store values under in local storage.
     * @param initialState - Either a value or a factory function to use as the
     * state's initial value.
     *
     * @returns A tuple containing a stateful value and a setter function,
     * identical to the return value of {@link useState}.
     *
     * @template T - The type of the stateful value.
     *
     * @see {@link localStorage}
     * @see {@link useState}
     */
    <T>(key: string, initialState: T | (() => T)): [
        T,
        Dispatch<SetStateAction<T>>
    ]
}

/**
 * @internal
 *
 * @param key
 * @param initialState
 * @returns
 */
const useClientLocalStorage: UseLocalStorage = (
    key,
    initialState = undefined
) => {
    const [value, _setValue] = useState(() => {
        // TODO: Should we check for `null` as well?
        if (initialState !== undefined) {
            return typeof initialState === 'function'
                ? initialState()
                : initialState
        }

        const storedEncodedValue = window.localStorage.getItem(key)
        if (storedEncodedValue) {
            try {
                return JSON.parse(storedEncodedValue)
            } catch (e) {
                // Should the error be logged here?
                return storedEncodedValue
            }
        }
    })

    useEffect(() => {
        if (value === undefined) {
            window.localStorage.removeItem(key)
        } else {
            window.localStorage.setItem(
                key,
                typeof value === 'string' ? value : JSON.stringify(value)
            )
        }
        // return () => localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, _setValue]
}

/**
 * @internal
 * @param _key
 * @param initialState
 * @returns
 */
const useServerLocalStorage: UseLocalStorage = (
    _key,
    initialState = undefined
) => {
    return useState(initialState)
}

const useLocalStorage: UseLocalStorage = canUseDOM()
    ? useClientLocalStorage
    : useServerLocalStorage

/**
 * Similar to `useState`, but values are persisted in the browser's local
 * storage.
 *
 * When state is updated using the returned setter, the new value is saved to
 * local storage under the given `key`. Setting the value to `undefined` will
 * remove it from local storage. Local storage updates are performed lazily to
 * prevent blocking the main rendering thread.
 *
 * If provided, the initial state parameter will be used as the state's
 * starting value. Otherwise existing data persisted in local storage will
 * be used. If neither are available, the state will be `undefined`.
 *
 * @param key - The key to store values under in local storage.
 * @param initialState - Either a value or a factory function to use as the
 * state's initial value.
 *
 * @returns A tuple containing a stateful value and a setter function,
 * identical to the return value of {@link useState}.
 *
 * @template T - The type of the stateful value.
 *
 * @see {@link localStorage}
 * @see {@link useState}
 */
export default useLocalStorage
