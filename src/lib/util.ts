export const sleep = (delay: number) =>
    new Promise<void>(resolve => setTimeout(() => resolve(), delay))

export const canUseDOM = () =>
    typeof window !== undefined &&
    typeof document !== undefined &&
    typeof document.createElement !== undefined
