/* eslint-disable @typescript-eslint/no-explicit-any */
export type Promisify<T extends (...args: any[]) => any> = T extends (
    ...args: any
) => Promise<any>
    ? T
    : (...args: Parameters<T>) => Promise<ReturnType<T>>

export type CancelablePromisify<T extends (...args: any[]) => any> = T extends (
    ...args: any
) => Promise<infer R>
    ? (...args: Parameters<T>) => CancelablePromise<R>
    : (...args: Parameters<T>) => CancelablePromise<ReturnType<T>>

export type Nullish<T> = T | null | undefined

export type CancelablePromise<T> = Promise<T> & { cancel: () => void }
