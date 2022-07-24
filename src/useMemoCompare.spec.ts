import { renderHook, RenderHookResult } from '@testing-library/react-hooks'
import useMemoCompare, { Compare } from './useMemoCompare'

describe('useMemoCompare(curr, compare) simple usage', () => {
    type Test = { a: string }
    const compareTest: Compare<Test> = (a, b) => a.a === b.a

    let result: RenderHookResult<Test, Test>
    const base: Test = { a: 'test' }

    beforeEach(() => {
        result = renderHook<Test, Test>(
            curr => useMemoCompare(curr, compareTest),
            { initialProps: base }
        )

        result.result
    })

    afterEach(() => {
        result.unmount()
    })

    it('originally returns the original object', () => {
        expect(result.result.current).toEqual(base)
    })

    it('when a similar object is passed, it returns the original object', () => {
        const nextObject = { a: 'test' }
        // Objects are structurally equal, but fail a shallow equality check
        expect(Object.is(base, nextObject)).toBe(false)
        expect(compareTest(base, nextObject)).toBe(true)

        // Original object is memoized
        result.rerender(nextObject)
        expect(result.result.current).toEqual(base)
    })

    it('when a different object is passed, it returns the new object', () => {
        const nextObject = { a: 'test2' }
        // Objects fail structural and shallow equality
        expect(Object.is(base, nextObject)).toBe(false)
        expect(compareTest(base, nextObject)).toBe(false)

        // Next object is returned and memoized
        result.rerender(nextObject)
        expect(result.result.current).toEqual(nextObject)
    })
})

describe('useMemoCompare(curr, compare) complex usage', () => {
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
