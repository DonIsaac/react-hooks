import { renderHook, RenderHookResult, act } from '@testing-library/react-hooks'
import React from 'react'
import useLocalStorage from './useLocalStorage'

type TValue<T> = [T, React.Dispatch<React.SetStateAction<T>>]
describe('useLocalStorage(key)', () => {
    const key = 'key'
    let hook: RenderHookResult<unknown, TValue<any | undefined>>
    const current = () => hook.result.current

    beforeAll(() => {
        jest.setTimeout(10_000)
    })

    afterAll(() => {
        // Reset the timeout to the default
        jest.setTimeout(5000)
    })

    afterEach(() => {
        localStorage.removeItem(key)
    })

    describe('when no value is stored and no initial state is provided', () => {
        beforeEach(() => {
            hook = renderHook(() => useLocalStorage<string>(key))
        })

        it('initially returns undefined', () => {
            const [currentValue] = current()
            expect(currentValue).toBeUndefined()
        })

        describe('when a string value is set', () => {
            const value = 'value'

            beforeEach(async () => {
                const [, setValue] = current()

                act(() => {
                    setValue(value)
                })
            })

            it('the state is updated to the new value', () => {
                const [currentValue] = current()
                expect(currentValue).toBe(value)
            })

            it('local storage contains the new value under `key`', () => {
                expect(localStorage.getItem(key)).toBe(value)
            })
        })

        describe('when an object value is set', () => {
            const value = { a: 1, b: 2 }

            beforeEach(() => {
                const [, setValue] = current()

                act(() => {
                    setValue(value)
                })
            })

            it('the state is updated to the new value', () => {
                const [currentValue] = current()
                expect(currentValue).toBe(value)
            })

            it('local storage contains the new value under `key`', () => {
                expect(localStorage.getItem(key)).toBe(JSON.stringify(value))
            })
        })
    }) // </no value, no initial state>

    describe.each(['initial', () => 'initial'])(
        'when no value is stored and an initial state is provided',
        initialState => {
            beforeEach(() => {
                hook = renderHook(() => useLocalStorage(key, initialState))
            })

            it('initially returns the initial state', () => {
                const [currentValue] = current()
                expect(currentValue).toBe('initial')
            })

            describe('when a new value is set', () => {
                const value = 'value'

                beforeEach(() => {
                    const [, setValue] = current()

                    act(() => {
                        setValue(value)
                    })
                })

                it('the state is updated to the new value', () => {
                    const [currentValue] = current()
                    expect(currentValue).toBe(value)
                })

                it('local storage contains the new value under `key`', () => {
                    expect(localStorage.getItem(key)).toBe(value)
                })
            })
        }
    ) // </no value, with initial state>

    describe.each(['stored', { foo: 'this is a stored object' }])(
        'when %p is stored',
        stored => {
            const storedValueFor = (v: any) =>
                typeof v === 'string' ? v : JSON.stringify(v)

            beforeEach(() => {
                localStorage.setItem(key, storedValueFor(stored))
                // hook = renderHook(() => useLocalStorage(key))
            })

            describe('when no initial state is provided', () => {
                beforeEach(() => {
                    hook = renderHook(() => useLocalStorage(key))
                })

                it('initially returns the stored value', () => {
                    const [currentValue] = current()
                    expect(currentValue).toEqual(stored)
                })

                describe('when a new value is set', () => {
                    const value = 'value'

                    beforeEach(() => {
                        const [, setValue] = current()

                        act(() => {
                            setValue(value)
                        })
                    })

                    it('the state is updated to the new value', () => {
                        const [currentValue] = current()
                        expect(currentValue).toBe(value)
                    })

                    it('local storage contains the new value under `key`', () => {
                        expect(localStorage.getItem(key)).toBe(value)
                    })
                })

                describe('when the state is set to undefined', () => {
                    beforeEach(() => {
                        const [, setValue] = current()

                        act(() => {
                            setValue(undefined)
                        })
                    })

                    it('the state is updated to undefined', () => {
                        const [currentValue] = current()
                        expect(currentValue).toBeUndefined()
                    })

                    it('the value is removed from local storage', () => {
                        expect(localStorage.getItem(key)).toBeNull()
                    })
                })
            }) // </no initial state>

            describe.each(['initial', () => 'initial'])(
                'when an initial state is provided',
                initialState => {
                    beforeEach(() => {
                        hook = renderHook(() =>
                            useLocalStorage(key, initialState)
                        )
                    })

                    it('overrides the stored value with the initial value', () => {
                        const [currentValue] = current()
                        expect(currentValue).toBe('initial')
                    })

                    describe('when a new value is set', () => {
                        const value = 'value'

                        beforeEach(() => {
                            const [, setValue] = current()

                            act(() => {
                                setValue(value)
                            })
                        })

                        it('the state is updated to the new value', () => {
                            const [currentValue] = current()
                            expect(currentValue).toBe(value)
                        })

                        it('local storage contains the new value under `key`', () => {
                            expect(localStorage.getItem(key)).toBe(value)
                        })
                    })
                }
            ) // </value, with initial state>
        }
    ) // </value, no initial state>
})
