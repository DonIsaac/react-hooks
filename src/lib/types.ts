/* eslint-disable @typescript-eslint/no-explicit-any */
export type Promisify<T extends (...args: any[]) => any> = T extends (
    ...args: any
) => Promise<any>
    ? T
    : (...args: Parameters<T>) => Promise<ReturnType<T>>

export type Nullish<T> = T | null | undefined
