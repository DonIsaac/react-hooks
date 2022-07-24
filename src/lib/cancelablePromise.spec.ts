import { CancelablePromise } from './cancelablePromise'

describe('CancelablePromise', () => {
    let actual: CancelablePromise<number>

    afterEach(() => {
        actual = undefined as any
    })

    it('should be a Promise', () => {
        actual = new CancelablePromise((resolve, reject) =>
            Promise.resolve().then(() => resolve(1))
        )
        expect(actual).toBeInstanceOf(Promise)
    })

    describe('when the executor calls resolve', () => {
        const thenCb = jest.fn()
        const catchCb = jest.fn()

        beforeAll(() => {
            jest.useFakeTimers()
        })

        afterAll(() => {
            jest.useRealTimers()
        })

        beforeEach(() => {
            actual = new CancelablePromise<number>((resolve, reject) => {
                setTimeout(() => {
                    resolve(1)
                }, 100)
            })
            actual.then(thenCb).catch(catchCb)
        })

        afterEach(() => {
            jest.clearAllTimers()
        })

        describe('when not canceled', () => {
            beforeEach(() => {
                jest.runAllTimers()
            })

            it('the promise resolves', async () => {
                expect(await actual).toBe(1)
            })

            it('chained promises resolve', async () => {
                expect(thenCb).toHaveBeenCalledWith(1)
            })

            it('chained catches are not called', async () => {
                expect(catchCb).not.toHaveBeenCalled()
            })
        })

        describe('when canceled', () => {
            beforeEach(() => {
                actual.cancel()
                jest.runAllTimers()
            })

            it('is flagged as canceled', () => {
                expect(actual.isCanceled).toBe(true)
            })

            it('chained promises are not called', async () => {
                expect(thenCb).not.toHaveBeenCalled()
            })

            it('chained catches are not called', async () => {
                expect(catchCb).not.toHaveBeenCalled()
            })
        })
    })

    describe('when the executor rejects', () => {
        const thenCb: jest.Mock = jest.fn()
        const catchCb: jest.Mock = jest.fn()

        const error = new Error()

        const willReject = () =>
            new CancelablePromise<number>((resolve, reject) => {
                setTimeout(() => {
                    reject(error)
                }, 100)
            })

        describe('when not canceled', () => {
            it('the promise rejects', async () => {
                let err: unknown

                try {
                    await willReject()
                } catch (e) {
                    err = e
                } finally {
                    expect(err).toBe(error)
                }
            })

            it('promises chained using then() are not called', async () => {
                try {
                    await willReject().then(thenCb)
                } catch (e) {
                    // noop
                } finally {
                    expect(thenCb).not.toHaveBeenCalled()
                }
            })

            it('catch handler is called', async () => {
                try {
                    await willReject().catch(catchCb)
                } catch (e) {
                    // noop
                } finally {
                    expect(catchCb).toHaveBeenCalledWith(error)
                }
            })
        })

        describe('when canceled', () => {
            const sleep = (t: number) =>
                new Promise<void>(res => setTimeout(() => res(), t))

            beforeEach(() => {
                actual = willReject()
                actual.cancel()
            })

            it('is flagged as canceled', () => {
                expect(actual.isCanceled).toBe(true)
            })

            it('promises chained using then() are not called', async () => {
                try {
                    actual.then(thenCb)
                    await sleep(200)
                } catch (e) {
                    // noop
                } finally {
                    expect(thenCb).not.toHaveBeenCalled()
                }
            })

            it('catch handler is not called', async () => {
                try {
                    actual.catch(catchCb)
                    await sleep(200)
                } catch (e) {
                    // noop
                } finally {
                    expect(catchCb).not.toHaveBeenCalled()
                }
            })
        })
    })
})
