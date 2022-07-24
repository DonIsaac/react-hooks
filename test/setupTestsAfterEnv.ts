import { ensureMocksReset } from '@shopify/jest-dom-mocks'
import { assert } from 'console'
import { performance, Performance, PerformanceEntry } from 'perf_hooks'

const performanceMarkMock = jest.fn(performance.mark)

global.performance = performance as any
global.PerformanceEntry = PerformanceEntry as any
class MockPerformanceMeasure
    extends PerformanceEntry
    implements PerformanceMeasure
{
    declare readonly detail: any
    constructor() {
        super()
    }

    toJSON() {
        return {
            duration: 0,
            entryType: 'measure',
            name: '',
            startTime: 0,
        }
    }
}
Object.defineProperty(global, 'PerformanceMeasure', {
    value: MockPerformanceMeasure,
    writable: true,
    enumerable: true,
    configurable: true,
})
if (!global.performance.mark) {
    global.performance.mark = performance.mark as any
}
if (!global.performance.measure) {
    global.performance.measure = performance.measure as any
}

if (window) {
    window.performance = performance as any
}
// global.performance = performance as unknown as Window['performance']
// if (!global.performance.mark) {
//     global.performance.mark = performanceMarkMock
// }

// if (window && !window.performance) {
//     window.performance = performance as unknown as Window['performance']
//     if (!window.performance.mark) {
//         performanceMarkMock = jest.fn()
//         window.performance.mark = performanceMarkMock
//     }
// }

// afterEach(() => {
//     ensureMocksReset()
//     if (performanceMarkMock) {
//         performanceMarkMock.mockClear()
//     }
// })
