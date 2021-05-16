import { Request, Response, NextFunction, Handler } from "express";
import { Reply } from "./errors";

export type Element<T = any> = Array<ElementFn<T> | Element<T>>;

export interface ElementFn<T = any> {
  (ctx: Context<T>): Promise<unknown>;
  __isComponent?: boolean;
}

export interface MarkedElementFn extends Handler {
  __isComponent?: boolean;
}

export type Context<T = any> = {
  reply: Reply;
  req: Request;
  res: Response;
  yield: () => void;
  query: Request["query"];
  params: Request["params"];
  body: Request["body"];
  headers: Request["headers"];
  json: Response["json"];
  cookies: Request["cookies"];
  send: Response["send"];
  next: NextFunction;
  data: T;
};
