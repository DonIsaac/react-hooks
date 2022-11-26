import { useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
import { canUseDOM } from './lib/util'

export type UseLocalStorage = {
    <T>(key: string): [T | undefined, Dispatch<SetStateAction<T | undefined>>]
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

export const useLocalStorage: UseLocalStorage = canUseDOM()
    ? useClientLocalStorage
    : useServerLocalStorage
