import { useState, useCallback } from 'react'

const MAX_STATE_VALUE = 100

export default function useForceUpdate(): () => void {
    const [_, setState] = useState(0)
    const forceUpdate = useCallback(
        () => setState(state => (state + 1) % MAX_STATE_VALUE),
        [setState]
    )

    return forceUpdate
}
