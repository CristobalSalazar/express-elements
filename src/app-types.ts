import express from 'express'

export type Pipe<T extends Props = Props> = Array<ComponentHandler<T> | Pipe<T>>

export interface ComponentHandler<T extends Props = Props> {
  (props: T): any
  __isComponent?: boolean
}

export interface TranslatedComponentHandler extends express.Handler {
  __isComponent?: boolean
}

export type Props<T = unknown> = {
  req: express.Request
  res: express.Response
  next: express.Response
} & T
