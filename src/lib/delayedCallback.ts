/* eslint-disable no-inner-declarations */
// !!! THIS FILE IS PROBABLY DEPRECATED !!!
import { CancelablePromise, CancelablePromisify } from './cancelablePromise'

export interface DelayedCallbackOptions {
    strategy?: 'idle' | 'animation'
    delayTimeout?: number
}
/**
 * @todo should this be kept? Might not need it anymore (after useDelayedCallback)
 * @param callback
 * @param opts
 * @returns
 */
// export default function delayedCallback<T extends (...args: any[]) => any>(
//     callback: T,
//     opts: DelayedCallbackOptions = {}
// ): CancelablePromisify<T> {
//     const { strategy = 'idle' } = opts
//
//     const [requestDelayedCallback, cancelDelayedCallback] = {
//         idle: [requestIdleCallback, cancelIdleCallback],
//         animation: [requestAnimationFrame, cancelAnimationFrame],
//     }[strategy] as [
//         (callback: () => void, opts?: Record<string, any>) => number,
//         (handle: number) => void
//     ]
//
//     const delayedCallback = function delayedCallback(...args: any[]) {
//         let idleState: number | undefined
//
//         const promise = new Promise<ReturnType<T>>((resolve, reject) => {
//             idleState = requestDelayedCallback(
//                 () => {
//                     try {
//                         resolve(callback(...args))
//                     } catch (error) {
//                         reject(error)
//                     }
//                 },
//                 { timeout: opts.delayTimeout ?? 0 }
//             )
//         })
//
//         ;(promise as CancelablePromise<ReturnType<T>>).cancel = () =>
//             idleState && cancelDelayedCallback(idleState)
//
//         return promise as CancelablePromise<ReturnType<T>>
//     }
//
//     return delayedCallback as CancelablePromisify<T>
// }
