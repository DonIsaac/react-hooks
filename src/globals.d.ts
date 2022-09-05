/**
 * A generic event handler.
 *
 * Name isn't EventHandler to avoid naming collisions with React's EventHandler type.
 *
 * @see [WHATWG - EventHandler](https://html.spec.whatwg.org/multipage/webappapis.html#eventhandler)
 */
type DOMEventHandler = (event: Event) => unknown

/**
 * @see [MDN - BatteryManager](https://developer.mozilla.org/en-US/docs/Web/API/BatteryManager)
 */
interface BatteryManager extends EventTarget {
    /**
     * Whether the battery is currently charging. This is also set to `true`
     * when the browser is unable to report the state of the battery or the
     * computer has no battery.
     */
    readonly charging: boolean

    /**
     * The remaining time, in seconds, before the system's battery is fully
     * charged.
     *
     * It is set to 0 when there is no battery or the battery is fully charged,
     * or `Infinity` when the system battery is discharging.
     */
    readonly chargingTime: number

    /**
     *
     * The remaining time, in seconds, until the system's battery is completely
     * discharged and the system is about to be suspended.
     *
     * It is set to the value positive Infinity if the battery is charging,
     * the browser is unable to report the remaining discharging time,
     * there is no battery attached to the system, or otherwise.
     */
    readonly dischargingTime: number

    /**
     * The percent of battery left where 0 is the battery is completely depleted
     * and 1.0 is the battery is completely full.
     *
     * This is also set to `1.0` when the browser is unable to report the
     * battery's level or there is no battery attached to the system.
     */
    readonly level: number

    onchargingchange: DOMEventHandler
    onchargingtimechange: DOMEventHandler
    ondischargingtimechange: DOMEventHandler
    onlevelchange: DOMEventHandler

    addEventListener(type: 'charging', handler: DOMEventHandler)
    addEventListener(type: 'chargingtime', handler: DOMEventHandler)
    addEventListener(type: 'dischargingtime', handler: DOMEventHandler)
    addEventListener(type: 'level', handler: DOMEventHandler)
    addEventListener(type: string, handler: DOMEventHandler)
}

interface Navigator {
    /**
     * Returns a Promise that resolves to a {@link BatteryManager} object.
     * May not be available if the browser has not implemented the Battery
     * Status API
     */
    getBattery?: () => Promise<BatteryManager>
}
