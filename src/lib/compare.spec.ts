import { refEqual, shallowEqual, deepEqual } from './compare'

describe('refEqual(a, b)', () => {
    it.each([
        [1, 1, true],
        [1, 2, false],
        [true, true, true],
        [true, false, false],
        [null, null, true],
        [null, undefined, false],
        [undefined, undefined, true],
        [undefined, null, false],
        ['foo', 'foo', true],
        ['foo', 'bar', false],
        [Symbol.for('foo'), Symbol.for('foo'), true],
        [Symbol('foo'), Symbol('foo'), false],
    ] as [unknown, unknown, boolean][])(
        'refEqual(%p, %p) === %p',
        (a, b, expected) => {
            expect(refEqual(a, b)).toBe(expected)
        }
    )

    it('should return true for objects with the same reference', () => {
        const obj = { foo: 'bar' }
        expect(refEqual(obj, obj)).toBe(true)
    })

    it('should return false for objects with different references', () => {
        const obj = { foo: 'bar' }
        const obj2 = { foo: 'bar' }
        expect(refEqual(obj, obj2)).toBe(false)
    })
})

describe('shallowEqual(a, b)', () => {
    it.each([
        [1, 1, true],
        [1, 2, false],
        [true, true, true],
        [true, false, false],
        [null, null, true],
        [null, undefined, false],
        [undefined, undefined, true],
        [undefined, null, false],
        ['foo', 'foo', true],
        ['foo', 'bar', false],
        [Symbol.for('foo'), Symbol.for('foo'), true],
        [Symbol('foo'), Symbol('foo'), false],
        [[1, 2, 3], [1, 2, 3], true],
        [[1, 2, 3], [1, 2, 4], false],
        [[1, 2, 3], [1, 2, 3, 4], false],
        [{}, {}, true],
        [{ foo: 'bar' }, { foo: 'bar' }, true],
        [{ foo: 'bar' }, { foo: 'baz' }, false],
        [{ foo: 'bar' }, { foo: 'bar', baz: 'baz' }, false],
    ] as [unknown, unknown, boolean][])(
        'shallowEqual(%p, %p) === %p',
        (a, b, expected) => {
            expect(shallowEqual(a, b)).toBe(expected)
        }
    )
})

describe('deepEqual(a, b)', () => {
    it.each([
        [1, 1],
        [NaN, NaN],
        [0, 0],
        [-1, -1],
        [true, true],
        [false, false],
        [null, null],
        [undefined, undefined],
        ['hi', 'hi'],
        [Symbol.for('foo'), Symbol.for('foo')],
        [[], []],
        [
            [1, 2, 3],
            [1, 2, 3],
        ],
        [{ a: 1 }, { a: 1 }],
        [{}, {}],
    ])('deepEqual(%p, %p) === true', (a, b) => {
        expect(deepEqual(a, b)).toBe(true)
        expect(deepEqual(b, a)).toBe(true)
    })

    it.each([
        [1, 2],
        [null, undefined],
        [undefined, null],
        [{}, null],
        [false, true],
        [true, false],
        [Symbol.for('foo'), Symbol.for('bar')],
        [Symbol('foo'), Symbol('foo')],
        [0, NaN],
        [
            [1, 2, 3],
            [4, 5, 6],
        ],
        [
            [1, 2, 3],
            ['1', '2', '3'],
        ],
        [[], { a: 1 }],
        [
            [1, 2, 3],
            [1, 2, 3, 4],
        ],
        [1, 'hi'],
        [{ a: 1 }, { a: 2 }],
        [{ a: 1 }, { b: 1 }],
        [
            { a: 1, b: { c: { d: 'hello' } } },
            { a: 1, b: { c: { d: 'world' } } },
        ],
        ['hi', 'hello'],
        ['hi', 'Hi'],
    ])('deepEqual(%p, %p) === false', (a, b) => {
        expect(deepEqual(a, b)).toBe(false)
        expect(deepEqual(b, a)).toBe(false)
    })

    it('correctly handles deeply equal objects', () => {
        const a = {
            foo: {
                bar: {
                    baz: 'hi',
                    bang: 9,
                    boom: [1, 2, [3, 4], { blam: true }],
                },
                baz: [
                    {
                        a: ['a', 'b', 'c', 'd'],
                        b: { c: [false, true] },
                    },
                ],
            },
        }
        const b = {
            foo: {
                bar: {
                    baz: 'hi',
                    bang: 9,
                    boom: [1, 2, [3, 4], { blam: true }],
                },
                baz: [
                    {
                        a: ['a', 'b', 'c', 'd'],
                        b: { c: [false, true] },
                    },
                ],
            },
        }

        expect(deepEqual(a, b)).toBe(true)
    })

    it('correctly handles deeply unequal objects', () => {
        const a = {
            foo: {
                bar: {
                    baz: 'hi',
                    bang: 9,
                    boom: [1, 2, [3, 4], { blam: true }],
                },
                baz: [
                    {
                        a: ['a', 'b', 'c', 'd'],
                        b: { c: [false, true] },
                    },
                ],
            },
        }
        const b = {
            foo: {
                bar: {
                    baz: 'hi',
                    bang: 9,
                    boom: [1, 2, [3, 4], { blam: true, bloom: 9 }],
                },
                baz: [
                    {
                        a: ['a', 'b', 'c', 'd'],
                        b: { c: [false, true] },
                    },
                ],
            },
        }

        expect(deepEqual(a, b)).toBe(false)
    })

    it('returns true for equivalent objects with differently ordered keys', () => {
        const a = { foo: 1, bar: 2 }
        const b = { bar: 2, foo: 1 }
        expect(deepEqual(a, b)).toBe(true)
    })
})
