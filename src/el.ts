import * as T from "./app-types";
import express from "express";
import { flatten } from "./flatten";
import { Reply } from "./errors";
import { ESRCH } from "constants";

const DATA_KEY = Symbol("express-elements:data");

export function provider(props: any = {}): express.Handler {
  return function (req, res, next) {
    (req as any)[DATA_KEY] = props;
    next();
  };
}

export function createContext(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
  data: any
): T.Context<any> {
  return {
    reply: new Reply(res),
    yield: () => void 0,
    query: req.query,
    params: req.params,
    body: req.body,
    headers: req.headers,
    cookies: req.cookies,
    json: res.json.bind(res),
    send: res.send.bind(res),
    data,
    req,
    res,
    next,
  };
}

export function handler<T = any>(
  ...subjects: (
    | T.ElementFn<T>
    | T.Element<T>
    | object
    | number
    | string
    | null
  )[]
) {
  return flatten(subjects).map(convert);
}

function isCustomHandler(
  fn: T.ElementFn | T.MarkedElementFn
): fn is T.MarkedElementFn {
  return fn.__isComponent !== void 0;
}

export function convert(
  data: object | string | number | boolean | null | T.ElementFn
): express.Handler {
  if (typeof data === "function") {
    return createExpressHandler(data as T.ElementFn);
  } else {
    return convertData(data);
  }
}

function convertData(
  data: object | string | number | boolean | null
): express.Handler {
  const fn: T.MarkedElementFn = (req, res, next) => {
    handleReturnResponse(data, res);
    next();
  };
  fn.__isComponent = true;
  return fn;
}

function createExpressHandler(
  el: T.ElementFn | T.MarkedElementFn
): express.Handler {
  if (isCustomHandler(el)) {
    return el;
  }

  const handler: T.MarkedElementFn = async (req, res, next) => {
    const data = (req as any)[DATA_KEY]; // contains props from upstream
    const ctx = createContext(req, res, next, data);
    let shouldCallNext = true;
    const yieldfn = () => {
      shouldCallNext = false;
    };
    ctx.yield = yieldfn;

    try {
      const ret = await el(ctx);
      handleReturnResponse(ret, res);
      shouldCallNext && next();
    } catch (err) {
      next(err);
    }
  };

  handler.__isComponent = true;
  return handler;
}

export function handleReturnResponse(returnValue: any, res: express.Response) {
  if (returnValue instanceof Error) {
    throw returnValue;
  }

  if (returnValue === null) {
    return res.end();
  }

  switch (typeof returnValue) {
    case "undefined":
      return; // does nothing
    case "object":
      return res.json(returnValue);
    case "number":
      return res.sendStatus(returnValue);
    default:
      return res.send(returnValue);
  }
}
