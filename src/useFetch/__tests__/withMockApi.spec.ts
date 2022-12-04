import {
    act,
    renderHook,
    RenderHookResult,
    WaitForNextUpdateOptions,
} from '@testing-library/react-hooks'
import { RequestState } from '../../types'
import useFetch from '../useFetch'
import { server } from './mockServer'

describe('useFetch', () => {
    const port = 3001
    const makeUrl = (path: string) => `http://localhost:${port}${path}`
    const waitOptions: WaitForNextUpdateOptions = {
        timeout: 1000,
    }

    beforeAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.listen(port, resolve).on('error', reject)
        })
    })

    afterAll(async () => {
        await new Promise<void>((resolve, reject) => {
            server.removeAllListeners('request').close(err => {
                if (err) reject(err)
                else resolve()
            })
        })
    })

    describe('when fetching json', () => {
        let result: RenderHookResult<unknown, RequestState<any>>

        beforeEach(async () => {
            result = renderHook(() => useFetch(makeUrl('/todos/1')))
            // await act(async () => {
            //     await result.waitForNextUpdate(waitOptions)
            // })
        })

        afterEach(() => {
            result.unmount()
        })

        it('while the request is in flight, the result is in a pending state', () => {
            const { status, data, error } = result.result.current
            expect(status).toBe('pending')
            expect(data).toBeNull()
            expect(error).toBeNull()
        })

        it('when the server responds, the state updates to a successful status with the data', async () => {
            await act(async () => {
                await result.waitForNextUpdate(waitOptions)
            })

            const { status, data, error } = result.result.current
            expect(status).toBe('success')
            expect(data).toEqual({
                id: 1,
                title: 'todo title',
                completed: false,
            })
            expect(error).toBeNull()
        })
    })

    describe.each(['application/json', 'text/html', 'text/plain'])(
        'when the server responds with an error while getting %s data',
        mimeType => {
            let result: RenderHookResult<unknown, RequestState<any>>

            beforeEach(async () => {
                result = renderHook(() =>
                    useFetch(makeUrl('/error'), {
                        headers: { accept: mimeType },
                    })
                )
                await act(async () => {
                    await result.waitForNextUpdate(waitOptions)
                })
            })

            afterEach(() => {
                result.unmount()
            })

            it('request is in a failed state', () => {
                const { status, data, error } = result.result.current
                expect(status).toBe('error')
                expect(data).toBeNull()
                expect(error).not.toBeNull()
                expect(error).toBeInstanceOf(Error)
            })
        }
    )
})
