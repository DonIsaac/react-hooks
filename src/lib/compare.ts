/**
 * TODO: Use [deep-equal](https://npmjs.com/package/deep-equal) or equivalent
 */

type Key = string | symbol | number

/**
 * A comparison function that can be used to compare two objects.
 *
 * @param a The first object to compare.
 * @param b The second object to compare.
 *
 * @returns `true` if the objects are equal, `false` otherwise.
 */
export type Compare<T> = (a: T, b: T) => boolean

export const refEqual: Compare<unknown> = (a, b) => a === b
export const shallowEqual: Compare<unknown> = (a, b) => {
    // Quick check for reference equality.
    if (Object.is(a, b)) {
        return true
    }

    // Shallow check for arrays
    else if (Array.isArray(a) && Array.isArray(b)) {
        if (a.length != b.length) return false

        for (let i = 0; i < a.length; i++) {
            if (!Object.is(a[i], b[i])) return false
        }

        return true
    }

    // Shallow check for objects
    else if (typeof a === 'object' && typeof b === 'object') {
        if (a == null || b == null) return false
        const aKeys = Object.keys(a)
        const bKeys = Object.keys(b)

        if (aKeys.length != bKeys.length) return false

        // All keys in a are also in b and a[key] ref equals b[key]
        for (const key of aKeys) {
            if (!bKeys.includes(key)) return false
            if (!Object.is(a[key as keyof typeof a], b[key as keyof typeof b]))
                return false
        }

        return true
    }

    return false
}

export const deepEqual: Compare<unknown> = (a, b) => {
    if (Object.is(a, b)) return true

    if (a instanceof Array) {
        if (!(b instanceof Array)) return false
        if (a.length !== b.length) return false

        for (let i = 0; i < a.length; i++) {
            if (!deepEqual(a[i], b[i])) return false
        }

        return true
    } else if (typeof a === 'object') {
        if (typeof b !== 'object') return false
        // If a is nullish but a and b didn't pass the Object.is()
        // check, that means a is null and b is undefined or vice versa
        if (a == null || b == null) return false
        const aKeys = Object.keys(a).sort()
        const bKeys = Object.keys(b as object).sort()
        if (aKeys.length !== bKeys.length) return false
        for (let i = 0; i < aKeys.length; i++) {
            const aKey = aKeys[i]
            const bKey = bKeys[i]

            if (aKey !== bKey) return false
            if (
                !deepEqual(
                    (a as Record<Key, unknown>)[aKey],
                    (b as Record<Key, unknown>)[bKey]
                )
            ) {
                return false
            }
        }

        return true
    }

    return false
}
