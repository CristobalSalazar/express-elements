import express from 'express'
import { flatten } from './flatten'
import * as Types from './app-types'

const DATA_KEY = '__component_data'

export function provider(props: any): express.Handler {
  return function (req, res, next) {
    ;(req as any)[DATA_KEY] = props
    next()
  }
}

export function pipe<T extends Types.Props = Types.Props>(
  handler: Types.Pipe<T>,
  props: any = {}
) {
  return flatten(handler).map((componentHandler) =>
    toExpress(componentHandler, props)
  )
}

function isCustomHandler(
  handler: Types.ComponentHandler | Types.TranslatedComponentHandler
): handler is Types.TranslatedComponentHandler {
  return handler.__isComponent !== void 0
}

export function toExpress(
  handler: Types.ComponentHandler | Types.TranslatedComponentHandler,
  props: any
): Types.TranslatedComponentHandler {
  if (isCustomHandler(handler)) return handler
  const component: Types.TranslatedComponentHandler = async (
    req,
    res,
    next
  ) => {
    let key = (req as any)[DATA_KEY]
    Object.assign(key || {}, props)
    try {
      const ret = await handler(Object.assign({ req, res }, key))
      handleReturn(ret, res, next)
      next()
    } catch (err) {
      next(err)
    }
  }
  component.__isComponent = true
  return component
}

export function handleReturn(
  returnValue: any,
  res: express.Response,
  next: express.NextFunction
) {
  if (returnValue === null) return res.end()
  else if (returnValue instanceof Error) return next(returnValue)
  else if (res.writableEnded) return
  switch (typeof returnValue) {
    case 'undefined':
      return
    case 'object':
      return res.json(returnValue)
    default:
      return res.send(returnValue)
  }
}
