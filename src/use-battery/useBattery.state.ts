import type { Reducer } from 'react'

// =================================== STATE ===================================

export type BatteryState = NoBatteryDataAvailable | BatteryDataAvailable

type NoBatteryDataAvailable = {
    availability: Omit<BatteryAvailability, 'available'>
}

type BatteryDataAvailable = BatteryManagerData & {
    availability: 'available'
}

/**
 * @internal
 */
export type BatteryAvailability =
    | 'unknown'
    | 'unavailable'
    | 'loading'
    | 'available'

/**
 * State data stored within a {@link BatteryManager}. Excludes event listeners.
 * @internal
 */
export type BatteryManagerData = Pick<
    BatteryManager,
    'charging' | 'chargingTime' | 'dischargingTime' | 'level'
>

// ================================== ACTIONS ==================================

/**
 * @internal
 */
export type BatteryAction =
    | BatteryNotAvailable
    | BatteryManagerLoaded
    | BatteryUpdate
    | BatteryLevelChanged
    | BatteryChargingChanged
    | BatteryChargingTimeChanged
    | BatteryDischargingTimeChanged

type BatteryNotAvailable = {
    type: 'battery/notAvailable'
    availability: Exclude<BatteryAvailability, 'available'>
}

type BatteryManagerLoaded = {
    type: 'battery/managerLoaded'
} & BatteryManagerData

type BatteryLevelChanged = {
    type: 'battery/update'
    property: 'level'
    data: BatteryDataAvailable['level']
}

export type BatteryUpdate =
    | BatteryChargingChanged
    | BatteryChargingTimeChanged
    | BatteryDischargingTimeChanged
    | BatteryLevelChanged

type BatteryChargingChanged = {
    type: 'battery/update'
    property: 'charging'
    data: BatteryDataAvailable['charging']
}

type BatteryChargingTimeChanged = {
    type: 'battery/update'
    property: 'chargingTime'
    data: BatteryDataAvailable['chargingTime']
}

type BatteryDischargingTimeChanged = {
    type: 'battery/update'
    property: 'dischargingTime'
    data: BatteryDataAvailable['dischargingTime']
}

/**
 * @internal
 *
 * @param availability
 * @returns
 */
export const batteryUnavailable = (
    availability: Exclude<BatteryAvailability, 'available'> = 'unavailable'
): BatteryNotAvailable => ({
    type: 'battery/notAvailable',
    availability,
})
// ================================== REDUCER ==================================

/**
 * @internal
 *
 * @param state
 * @param action
 * @returns
 */
export const batteryReducer: Reducer<BatteryState, BatteryAction> = (
    state: Readonly<BatteryState>,
    action
) => {
    switch (action.type) {
        case 'battery/notAvailable':
            return {
                availability: action.availability,
            } as NoBatteryDataAvailable

        case 'battery/managerLoaded': {
            const { type, ...rest } = action
            return { ...rest, availability: 'available' }
        }

        case 'battery/update':
            return {
                ...state,
                [action.property]: action.data,
            }

        default:
            throw new Error(
                `Invalid battery action type: ${
                    (action as { type: string }).type
                }`
            )
    }
}
