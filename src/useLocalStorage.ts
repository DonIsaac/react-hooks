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

const useClientLocalStorage: UseLocalStorage = (
    key,
    initialState = undefined
) => {
    const [value, setValue] = useState(() => {
        const storedEncodedValue = window.localStorage.getItem(key)
        if (storedEncodedValue) {
            try {
                return JSON.parse(storedEncodedValue)
            } catch (e) {
                // Should the error be logged here?
                return typeof initialState === 'function'
                    ? initialState()
                    : initialState
            }
        } else {
            return typeof initialState === 'function'
                ? initialState()
                : initialState
        }
    })

    useEffect(() => {
        return () => localStorage.setItem(key, JSON.stringify(value))
    }, [key, value])

    return [value, setValue]
}

const useServerLocalStorage: UseLocalStorage = (
    _key,
    initialState = undefined
) => {
    return useState(initialState)
}

export const useLocalStorage: UseLocalStorage = canUseDOM()
    ? useClientLocalStorage
    : useServerLocalStorage
