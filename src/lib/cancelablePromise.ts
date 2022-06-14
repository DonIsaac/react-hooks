/**
 * this file is not done yet.
 */
export type CancelablePromisify<T extends (...args: any[]) => any> = T extends (
    ...args: any
) => Promise<infer R>
    ? (...args: Parameters<T>) => CancelablePromise<R>
    : (...args: Parameters<T>) => CancelablePromise<ReturnType<T>>

// export type CancelablePromise<T> = Promise<T> & { cancel: () => void }

export type Executor<T> = (
    resolve: (value: T | PromiseLike<T>) => void,
    reject: (reason?: unknown) => void
) => void

export class CancelablePromise<T> extends Promise<T> {
    protected _canceled = false

    constructor(executor: Executor<T>) {
        super((resolve, reject) => {
            executor(
                value => {
                    if (this._canceled) {
                        return
                    }
                    resolve(value)
                },
                reason => {
                    if (this._canceled) {
                        return
                    }
                    reject(reason)
                }
            )
        })
    }

    cancel() {
        this._canceled = true
    }

    public get isCanceled(): boolean {
        return this._canceled
    }
}

export class DelayedCancelablePromise<T> extends CancelablePromise<T> {
    private _handle: number | undefined
    private _canceler: (handle: number) => void

    constructor(
        fn: () => T | PromiseLike<T>,
        dispatcher: (cb: () => void) => number,
        canceler: (handle: number) => void
    ) {
        super(async (resolve, reject) => {
            this._handle = dispatcher(() => {
                try {
                    const result = fn()
                    if (result instanceof Promise) {
                        result.then(resolve, reject)
                    } else {
                        resolve(result)
                    }
                } catch (e) {
                    reject(e)
                }
            })
        })
        this._canceler = canceler
    }

    cancel() {
        if (this._handle) {
            this._canceler(this._handle)
            this._handle = undefined
        }

        super.cancel()
    }
}
