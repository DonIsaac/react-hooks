import { useState } from 'react'
import useMount from './useMount'

const useDidMount = () => {
    const [isMounted, setIsMounted] = useState(false)

    useMount(() => {
        setIsMounted(true)
    })

    return isMounted
}

export default useDidMount
