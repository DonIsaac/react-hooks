import { useState, useEffect, useCallback, useRef } from 'react'
import useMemoCompare from './useMemoCompare'

/**
 * Checks if the user has granted access to a specific permission. This
 * hook will request the permission if it has not been granted yet.
 *
 * @param permission the permission to check
 * @returns a boolean indicating whether the user has granted the permission
 */
export default function usePermissions(permission: PermissionName): boolean {
    const [hasPermission, setPermission] = useState(false)
    const [status, setStatus] = useState<PermissionStatus>()

    const updatePermission = useCallback(
        function updatePermission(this: PermissionStatus) {
            switch (this.state) {
                case 'granted':
                    setPermission(true)
                    break
                case 'prompt':
                    // TODO: request permission when browsers support it
                    // FIXME: should this be set to false or true?
                    setPermission(false)
                    break
                case 'denied':
                    setPermission(false)
                    break

                // This should never happen
                default:
                    setPermission(false)
                    break
            }
        },
        [setPermission]
    )

    useEffect(() => {
        navigator.permissions
            .query({
                name: permission,
            })
            .then(newStatus => setStatus(newStatus))
    }, [permission])

    const memoStatus = useMemoCompare(status)
    useEffect(() => {
        if (memoStatus) {
            memoStatus.addEventListener('change', updatePermission)
            return () =>
                memoStatus.removeEventListener('change', updatePermission)
        }
    }, [memoStatus, updatePermission])

    return hasPermission
}
