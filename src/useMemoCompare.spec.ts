import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import useMemoCompare, { Compare } from './useMemoCompare'

type Foo = {
    foo: number
    bar: {
        baz: boolean
        bang: string[]
    }
}

const compareFoo: Compare<Foo> = (a, b) => {
    if (a.foo !== b.foo || a.bar.baz !== b.bar.baz) return false

    const aBang = a.bar.bang,
        bBang = b.bar.bang
    if (aBang.length !== bBang.length) return false

    for (let i = 0; i < aBang.length; i++) {
        if (aBang[i] !== bBang[i]) return false
    }

    return true
}

describe('useMemoCompare(curr, compare)', () => {
    const base: Foo = {
        foo: 1,
        bar: {
            baz: true,
            bang: ['a', 'b', 'c'],
        },
    }

    let result: RenderHookResult<Foo, Foo>

    beforeEach(() => {
        result = renderHook<Foo, Foo>(
            curr => useMemoCompare(curr, compareFoo),
            { initialProps: base }
        )

        result.result
    })

    afterEach(() => {
        result.unmount()
    })

    it('initially returns the original object', () => {
        const { current } = result.result

        expect(current).toBe(base)
    })

    it('returns the original object when the next object is equal but not the same', () => {
        const next = { ...base }
        const { result: actual, rerender } = result

        expect(next).not.toBe(base)
        expect(next).toEqual(base)

        rerender(next)
        expect(actual.current).toBe(base)
    })

    it('returns the next object when its different from the original', () => {
        const next = { ...base, foo: 10 }
        const { result: actual, rerender } = result

        expect(next).not.toEqual(base)

        rerender(next)
        expect(actual.current).toBe(next)
    })
})
