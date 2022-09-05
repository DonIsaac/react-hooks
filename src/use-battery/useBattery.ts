import { useEffect, useRef, useReducer } from 'react'
import {
    BatteryManagerData,
    batteryReducer,
    BatteryState,
    batteryUnavailable,
    BatteryUpdate,
} from './useBattery.state'

/**
 * Provides access to a system's battery state.
 *
 * @returns
 *
 * @see {@link BatteryManager}
 * @see {@link BatteryState}
 */
export const useBattery = (): BatteryState => {
    const battery = useRef<BatteryManager>()

    const [state, dispatch] = useReducer(batteryReducer, initialState)

    useEffect(() => {
        // Only run this callback once
        if (battery.current) return

        if (!('getBattery' in navigator)) {
            // startAvailabilityTransition(() => setAvailability('unavailable'))
            dispatch(batteryUnavailable())
            return
        }

        dispatch(batteryUnavailable('loading'))

        navigator.getBattery?.().then(batteryManager => {
            battery.current = batteryManager

            // Update current state
            const { charging, chargingTime, dischargingTime, level } =
                batteryManager
            dispatch({
                type: 'battery/managerLoaded',
                charging,
                chargingTime,
                dischargingTime,
                level,
            })

            // Create and attach event listeners for each battery manager
            // field so that when one changes, it dispatches an update action.
            // Store a mapping of property names to their event listener functions
            const batteryProperties = [
                'level',
                'charging',
                'chargingTime',
                'dischargingTime',
            ] as const
            const updateEventListeners = batteryProperties.reduce(
                (listeners, property) => {
                    // Event listener to dispatch an update action for the
                    // current battery manager property
                    const onUpdate: DOMEventHandler = () =>
                        battery.current &&
                        dispatch({
                            type: 'battery/update',
                            property,
                            data: battery.current[property],
                        } as BatteryUpdate)

                    batteryManager.addEventListener(
                        property.toLowerCase() as Lowercase<typeof property>,
                        onUpdate
                    )
                    listeners[property] = onUpdate
                    return listeners
                },
                {} as Record<keyof BatteryManagerData, DOMEventHandler>
            )

            // When the component unmounts, unmount all event listeners
            return () => {
                Object.entries(updateEventListeners).forEach(
                    ([property, onUpdate]) => {
                        batteryManager.removeEventListener(property, onUpdate)
                    }
                )
            }
        })
    }, [])

    return state
}

const initialState = {
    availability: 'unknown' as const,
} as const
