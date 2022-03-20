/**
 * TODO: Use [deep-equal](https://npmjs.com/package/deep-equal) or equivalent
 */

type Key = string | symbol | number

export default function deepEqual(a: unknown, b: unknown): boolean {
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
        if (a == null) return false
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
