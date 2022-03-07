import { EffectCallback, useEffect } from 'react'

const useMount = (effect: EffectCallback) => {
    useEffect(effect, [])
}

export default useMount
