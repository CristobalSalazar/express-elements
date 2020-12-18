# Express Pipes

A lightweight, zero dependency library that allows you to create modular, reusable components in express.

Inspired heavily by React and Koa

## Installation

```bash
npm install express-pipes
```

```bash
yarn add express-pipes
```

## Pipes

A pipe is simply an array of middleware functions that get executed in order.

```js
const MyPipe = [
  (props) => {
    console.log('First!')
  },
  (props) => {
    console.log('Second!')
  },
  (props) => {
    console.log('Third!')
  },
]
```

Each function in the array accepts a props object containing [req](https://expressjs.com/en/api.html#req) and [res](https://expressjs.com/en/api.html#res).

```js
const Logger = [
  ({ req, res }) => {
    console.log(req.method, req.url)
  },
]
```

Pipes are **composable** You can nest pipes within themselves which allows you to breakdown and reuse logic across different components

```js
const CleanUp1 = [
  (props) => {
    console.log('doing some clean up')
  },
]

const CleanUp2 = [
  (props) => {
    console.log('doing some more clean up')
  },
]

const CleanUp = [CleanUp1, CleanUp2]

const MessyPipe = [
  (props) => {
    console.log('making a mess')
  },
  CleanUp, // Runs CleanUp1 and CleanUp2
]
```

You can also create higher order components similar to React.

We could have used clean up as such:

```js
function withCleanUp(component) {
  return [component, CleanUp1, CleanUp2]
}

const MessyPipe = withCleanUp([
  (props) => {
    console.log('making a mess')
  },
])
```

## Passing Data

Instead of attaching data to the request object as is typical in express, you can attach to props. This avoids overcrowding the request object.

```js
const AddUser = [
  (props) => {
    props.user = {
      username: 'foo',
    }
  },
  ({ user }) => {
    console.log('added user', user.username) // 'added user foo'
  },
]
```

## Return Values

Returning a value from a function will call the respective res function.

```js
const MyPipe = [
  (props) => {
    return { foo: 'bar' } // res.json({ foo: 'bar' })
  },
]
```

These are the corresponding functions that get called on return values

```js
// objects use res.json()
(props) => {
  return { foo: 'bar' }
},

// strings use res.send()
(props) => {
  return 'hello'
},

// numbers use res.sendStatus()
(props) => {
  return 1
},

// null uses res.end()
(props) => {
  return null
},

// instances of Error are passed to express via next(error)
(props) => {
  return new Error('Woops!')
},
```

Throwing from a function will also get passed to express for error handling

```js
(props) => {
  throw { message: 'Woops!' } // calls next({ message: 'Woops!' })
},
```

## Registration

To register a component in a way that express can understand you need to use the pipe method on your component.

The pipe method transforms your component into express middleware

```js
const { pipe } = require('express-pipes')
```

Then somewhere in your app

```js
const Logger = [
  (props) => {
    console.log(props.req.method, props.req.url)
  },
]

app.use(pipe(Logger))
```

You may also wish to use the pipe method directly on components

```js
const Logger = pipe([
  (props) => {
    console.log(props.req.method, props.req.url)
  },
])

app.use(Logger)
```

pipe is smart enough to know which components it has already transformed. You can use it on every component at no cost

```js
const Component1 = pipe([
  () => {
    console.log('hello from component 1')
  },
])

const Component2 = pipe([
  Component1, // perfectly valid,
  () => console.log('hello from component 2')
])

const withComponent1And2(component) {
  return pipe([  // also valid
    Component1,
    Component2,
    component
  ])
}
```

## Provider

The only other export apart from pipe (and type definitions) is provider

```js
const { provider } = require('express-pipes')
```

Provider allows you to populate the props object with values to be consumed by pipes downstream

For instance you can use it to provide services to your pipes

```js
// Define your services
const ServiceProvider = provider({
  validate: new ValidationService(),
  models: new ModelService(),
})

// Register them
app.use(ServiceProvider)

// Consume them
const Register = pipe([
  async (props) => {
    const { validate, models } = props
    const { email, name, password } = validate.register(req.body)
    const user = await models.User.create({ email, name, password })
    props.user = user
  },
  SendRegistrationEmail,
])

app.post('/register', Register)
```

## Typescript

Strong type support is included as express pipes was built with typescript.

To define a pipe component use the Pipe type

```ts
import { Pipe } from 'express-pipes'

const Component: Pipe = [
  (props) => {
    // these will have types
    props.req
    props.res
  },
]
```

## Custom Types

You will most likely be modifying the props object at some point in your application either with services or with data. In this case you will want to extends the props type.

Assuming we have an object somewhere in our code that exports our services

```ts
// ./services.ts

export default {
  jwt: new JwtService(),
  logger: new LoggerService(),
}
```

To Access these types across our project we will want to make use of Props and Pipe types both exported from the library.

```ts
import { Props, Pipe } from 'express-pipes'
import services from './services'
```

Now we can make use of these types to get type inferrence with the services.

Using default props type

```ts
const Component = [
  (props: Props<typeof services>) => {
    //
  },
]
```

Using custom props type

```ts
export type MyProps = Props<typeof services>

const Component = [
  (props: MyProps) => {
    //
  },
]
```

Using default pipe type

```ts
const Component: Pipe<MyProps> = [
  (props) => {
    //
  },
]
```

Using custom pipe type

```ts
type MyPipe = Pipe<MyProps>

const Component: MyPipe = [
  (props) => {
    //
  },
]
```

**You should declare both a custom props type and a custom handler this will make it easy to get type inferrences accross all your components that use the custom props.**

Usage with pipe requires the props type

```ts
const Component = pipe<MyProps>([
  (props) => {
    //
  },
])
```
