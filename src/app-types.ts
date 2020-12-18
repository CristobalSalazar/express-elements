import T from "express";

export type Element<T extends Props = Props> = Array<ElementFn<T> | Element<T>>;

export interface ElementFn<T extends Props = Props> {
  (props: T): any;
  __isComponent?: boolean;
}

export interface MarkedElementFn extends T.Handler {
  __isComponent?: boolean;
}

export type Props<T = unknown> = {
  req: T.Request;
  res: T.Response;
  next: T.Response;
} & T;
