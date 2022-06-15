# React Hooks

<center>

[![Gated
CI](https://github.com/DonIsaac/react-hooks/actions/workflows/gated.yml/badge.svg)](https://github.com/DonIsaac/react-hooks/actions/workflows/gated.yml)
[![Maintainability](https://api.codeclimate.com/v1/badges/b6ed3aa3919453639f7a/maintainability)](https://codeclimate.com/github/DonIsaac/react-hooks/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/b6ed3aa3919453639f7a/test_coverage)](https://codeclimate.com/github/DonIsaac/react-hooks/test_coverage)

</center>

A toolkit of useful React hooks.

# Hooks
- [`useFetch(url, fetchOptions)`](#usefetchurl-fetchoptions)
- [`useDelayedCallback(cb, opts)`](#usedelayedcallbackcb-opts)
- [`useInterval(callback, delay)`](#useintervalcallback-delay)
- [`useMeasuredCallback(callback, deps, onMeasure?)`](#usemeasuredcallbackcallback-deps-onmeasure)
- [`useMount(effect)`](#usemounteffect)
- [`useDidMount()`](#usedidmount)
- [`useForceUpdate()`](#useforceupdate)

## `useFetch(url, fetchOptions)`

Makes a [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
request to a URL, returning information about the state of the request. 

The state object contains three properties: `status`, `data`, and `error`. By
checking `status` you can create lazy-loaded components.

- While the request is in progress, `status` will be `pending` and both `data`
  and `error` will be `null`.

- When the request completes, `status` will be `success`. The response payload
  will be parsed and stored in `data`.

- If the request fails, `status` is set to `error` and the thrown error is stored
  in the `error` property.

### Examples

This example creates a TODO list from data retrieved from your API. JSON data
in the response body will be parsed into an object.

```tsx
import { FC, useEffect } from 'react'
import useFetch, { RequestState, RequestStatus } from '@donisaac/react-hooks'

type TodoTasks = string[]

// Create a list of todo items from data fetched from your backend
const TodoList: FC = () => {
    const { status, data, error } = useFetch<TodoTasks>('https://my-api.com/todo')

    // Do _not_ use data in your dependency array! Instead, use status.
    useEffect(() => {
        console.log('Todo tasks: ', data)
    }, [status])

    if (status === 'pending') {
        // API request has not completed
        return <span>Getting tasks...</span>

    } else if (status === 'success') {
        // Successfully got data from API
        return (
            <ol id="tasks">
                {data.map(task => <li key={task}>{task}</li>)}
            </ol>
        )

    } else {
        // Fetch threw an error, usually because the API returned a 4xx or 5xx
        // response.
        return <span>Could not get task list: ${error.message}</span>
    }
}
```

This example gets a user's profile picture and displays it in an image. When
response bodies contain images, they are parsed into
[Blobs](https://developer.mozilla.org/en-US/docs/Web/API/Blob).

```tsx
import { FC, useState, useEffect } from 'react'
import useFetch, { RequestState, RequestStatus } from '@donisaac/react-hooks'

import defaultProfilePicture from './img/default-profile.png'

// Get the user's profile picture from your backend and display it as an image
const ProfilePicture: FC<{ username: string }> = ({ username }) => {
    const {
        status,
        data: profilePic,
        error
    } = useFetch<Blob>(`https://my-api.com/user/${username}/profile`)

    const [imageSrc, setImageSrc] = useState(defaultProfilePicture)

    useEffect(() => {
        if (status === 'success') {
            const imageUrl: string = URL.createObjectURL(data)
            setImageSrc(imageUrl)

        } else if (status === 'error') {
            // Log any errors that occur so we know there's a problem.
            // Don't change the profile picture - we'll fall back to the default
            // one.
            console.error(error)
        }
    }, [status])

    return (
        <img
            className="profile-pic"
            src={defaultProfilePicture}
            alt={`${username}'s profile picture`}
        />
    )
}
```

----

## `useDelayedCallback(cb, opts)`

Similar to
[useCallback()](https://reactjs.org/docs/hooks-reference.html#usecallback),
this hook returns a memoized callback whose execution is deferred. This allows
you to run expensive or lazy code you don't need done immediately, keeping the
[main thread](https://developer.mozilla.org/en-US/docs/Glossary/Main_thread)
unblocked.

### Delay Strategies
> For a high-level description of Node's event loop, checkout [this docs page](https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/).

To tell the hook how to defer the function, provide it a _strategy_. By default,
`idle` is used. The available strategies are:

- `idle`: The function will execute when the main thread isn't busy. You can
  provide a `timeout` to force execution, idle or not, after a certain amount of
  time. Uses
  [useIdleCallback](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestIdleCallback).

- `animation`: The function will execute before the next repaint. Uses
  [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame).

- `timeout`: The function will execute after `timeout` milliseconds. Uses
  [setTimeout](https://developer.mozilla.org/en-US/docs/Web/API/setTimeout).

- `resolve`: The function will execute after all remaining currently scheduled
  events have run. More specifically, execution is pushed to the end of the
  microtask queue for the current event loop stage by using
  [Promise.resolve().then()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/resolve).
  See [this PR](https://github.com/nodejs/node-v0.x-archive/pull/8325) for
  microtask queue details.

- `resolve`: The function's execution is pushed to the end of the event queue.
  It will execute within the event loop cycle it was called in, but after all
  other currently pending events have been processed. uses
  
> NOTE:
> Some strategies rely on nitty-gritty details of the event loop. Because of this,
> runtime behavior may differ depending on where you're running your
> application.For example, Node uses [libuv](https://libuv.org/) while Chrome uses
> [libevent](https://libevent.org/). You may find [this StackOverflow
> post](https://stackoverflow.com/questions/31582672/what-is-the-different-between-javascript-event-loop-and-node-js-event-loop)
> helpful.

The returned callback accepts the same parameters as the original callback,
except it returns a cancelable Promise. This Promise resolves with the original
callback's return value, or rejects if it throws. You can use its `cancel()`
method to prevent execution if it hasn't run yet or prevent chained promises
from being called if it has. Additionally, pending callbacks will be canceled
when the component unmounts, making it safe to run `useState()` setters within
your callback.

### Example
_TODO_

----

## `useInterval(callback, delay)`

Uses [setInterval()](https://developer.mozilla.org/en-US/docs/Web/API/setInterval)
to repeatedly call `callback` every `delay` milliseconds.

### Example

```tsx
import { FC, useState, useEffect } from 'react'
import useInterval from '@donisaac/react-hooks'

export const Timer: FC = () => {
    const [date, setDate] = useState(new Date())

    // Update date every second
    useInterval(() => {
        setDate(new Date())
    }, 1000)

    return (
        <span>
            {date.toLocaleTimeString()}
        </span>
    )
}
```

----

## `useMeasuredCallback(callback, deps, onMeasure?)`

Similar to
[useCallback()](https://reactjs.org/docs/hooks-reference.html#usecallback),
this hook returns a memoized callback whose execution time is recorded. When
the returned callback is called, the `onMeasure` callback is invoked with the
amount of time it took to run. Execution times are also displayed in the DevTools
Performance Timeline. This lets you monitor time-consuming operations.

### Example

```tsx
import { FC, useCallback, useEffect } from 'react'
import useMeasuredCallback from '@donisaac/react-hooks'
import intensiveTask from './intensiveTask'

export const MyComponent: FC<{ logger?: typeof Console }> = ({
    logger = console
}) => {
    const [result, setResult] = useState<ReturnType<typeof intensiveTask> | undefined>(undefined)

    const onMeasure = useCallback((measure: PerformanceMeasure) => {
        logger.log(`intensive task took ${measure.duration} ms to run`)
    })

    const measuredIntensiveTask = useMeasuredCallback(
        intensiveTask,
        [],
        onMeasure
    )

    // Only call the function when needed (it takes a while to run!)
    useEffect(() => {
        setResult(measuredIntensiveTask())
    }, [measuredIntensiveTask])

    return <div>{result}</div>
}
```
----

## `useMount(effect)`

Similar to
[useEffect()](https://reactjs.org/docs/hooks-reference.html#useeffect), but
`effect` is only called once after the component has completed its initial render
and has been mounted to the DOM. You can think of this as the hook version of
`componentDidMount()`.

### Example

```tsx
import { FC } from 'react'
import useMount from '@donisaac/react-hooks'

export const MyComponent: FC = () => {
    useMount(() => {
        console.log('component has been mounted to the DOM')

        return () => console.log('component has been unmounted from the DOM')
    })

    return <div />
}
```

----

## `useDidMount()`

Similar to `useMount()`, except it returns a boolean that is set to true when the component mounts instead of calling an effect function.

### Example

```tsx
import { FC } from 'react'
import useDidMount from '@donisaac/react-hooks'

export const MyComponent: FC = () => {
    const isMounted = useDidMount()
    return (
        <span>MyComponent {isMounted ? 'is' : 'is not'} mounted to the DOM</span>
    )
}
```

----

## `useForceUpdate()`

Allows you to force a component to rerender whether or not React has detected a
state change. The function returned by this hook will cause the rerender when
called.

### Example

```tsx
import { FC, useRef, useEffect } from 'react
import { useForceUpdate } from '@donisaac/react-hooks'
// Displays an update counter and a button to force an update. This is 
// not exactly best practice, but it is a good example of how to use
// this hook.
const TestComponent: FC = () => {
    const forceUpdate = useForceUpdate()
    const updateCount = useRef(0)
    // Increment the update counter on each rerender
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
```
