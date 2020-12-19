import { Request, Response, NextFunction, Handler } from "express";

export type Element<T = any> = Array<ElementFn<T> | Element<T>>;

export interface ElementFn<T = any> {
  (props: Props<T>): any;
  __isComponent?: boolean;
}

export interface MarkedElementFn extends Handler {
  __isComponent?: boolean;
}

export type Props<T = any> = {
  req: Request;
  res: Response;
  next: NextFunction;
  data: T;
};
