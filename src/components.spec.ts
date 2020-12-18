import express from 'express'
import async from 'async'
import request from 'supertest'
import { pipe, provider } from './components'
import { Pipe, Props } from './app-types'

describe('Components', () => {
  let app: express.Application

  beforeEach(() => {
    app = express()
  })

  it('should mount components as valid express middleware', (done) => {
    const MyComponent: Pipe = [
      (props) => {
        return 'hello world'
      },
    ]
    app.get('/', pipe(MyComponent))
    request(app).get('/').expect('hello world', done)
  })

  it('should reference same instance of props provided down', (done) => {
    let constructorCallCount = 0
    class Service {
      constructor() {
        constructorCallCount++
      }
    }
    const services = {
      service: new Service(),
    }

    type AppProps = Props<typeof services>
    const ServiceProvider = provider(services)

    app.use(ServiceProvider)
    app.get(
      '/',
      pipe<AppProps>([
        (props) => {
          expect(props.service).toBeDefined()
          expect(props.service).toBe(services.service)
        },
      ])
    )
    async.series(
      [
        (cb) => request(app).get('/').end(cb),
        (cb) => request(app).get('/').end(cb),
        (cb) => request(app).get('/').end(cb),
        (cb) => request(app).get('/').end(cb),
      ],
      () => {
        expect(constructorCallCount).toBe(1)
        done()
      }
    )
  })
})
