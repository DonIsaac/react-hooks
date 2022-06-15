import React, { FC, useEffect, useRef } from 'react'
import { act, render, RenderResult } from '@testing-library/react'
import useForceUpdate from './useForceUpdate'

const TestComponent: FC = () => {
    const forceUpdate = useForceUpdate()
    const updateCount = useRef(0)
    useEffect(() => {
        updateCount.current++
    })

    return (
        <div>
            <span data-testid="update-count" id="update-count">
                {updateCount.current}
            </span>
            <button onClick={forceUpdate}>Force Update</button>
        </div>
    )
}

describe('useForceUpdate()', () => {
    let result: RenderResult

    beforeEach(() => {
        result = render(<TestComponent />)
    })

    afterEach(() => {
        result.unmount()
    })

    it('update count starts at 0', () => {
        const updateCount = result.getByTestId('update-count')
        expect(updateCount).toBeDefined()
        expect(updateCount.textContent).toBe('0')
    })

    it('update count increases after force update', () => {
        const updateCount = result.getByTestId('update-count')
        const forceUpdateButton = result.getByText('Force Update')
        act(() => {
            forceUpdateButton.click()
        })

        expect(updateCount.textContent).toBe('1')
    })
})
