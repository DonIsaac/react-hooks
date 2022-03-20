import deepEqual from './deepEqual'

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
    ])('deepEqual(%p, %p) === true', (a, b) => {
        expect(deepEqual(a, b)).toBe(true)
    })

    it.each([
        [1, 2],
        [null, undefined],
        [undefined, null],
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
        [1, 'hi'],
        [{ a: 1 }, { a: 2 }],
        [{ a: 1 }, { b: 1 }],
        ['hi', 'hello'],
        ['hi', 'Hi'],
    ])('deepEqual(%p, %p) === false', (a, b) => {
        expect(deepEqual(a, b)).toBe(false)
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
})
