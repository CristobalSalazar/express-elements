import * as ElementTypes from "./app-types";
import express from "express";
import { flatten } from "./flatten";

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
): ElementTypes.Context<any> {
  return {
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

export function el<T = any>(
  ...subjects: (
    | ElementTypes.ElementFn<T>
    | ElementTypes.Element<T>
    | object
    | number
    | string
    | null
  )[]
) {
  return flatten(subjects).map(convert);
}

function isCustomHandler(
  fn: ElementTypes.ElementFn | ElementTypes.MarkedElementFn
): fn is ElementTypes.MarkedElementFn {
  return fn.__isComponent !== void 0;
}

export function convert(
  data: object | string | number | boolean | null | ElementTypes.ElementFn
): express.Handler {
  if (typeof data === "function") {
    return createExpressHandler(data as ElementTypes.ElementFn);
  } else {
    return convertData(data);
  }
}

function convertData(
  data: object | string | number | boolean | null
): express.Handler {
  const fn: ElementTypes.MarkedElementFn = (req, res, next) => {
    handleReturnResponse(data, res);
    next();
  };
  fn.__isComponent = true;
  return fn;
}

function createExpressHandler(
  el: ElementTypes.ElementFn | ElementTypes.MarkedElementFn
): express.Handler {
  if (isCustomHandler(el)) {
    return el;
  }

  const handler: ElementTypes.MarkedElementFn = async (req, res, next) => {
    try {
      const data = (req as any)[DATA_KEY]; // contains props from upstream
      const ctx = createContext(req, res, next, data);

      let shouldCallNext = true;

      const preventNext = () => {
        shouldCallNext = false;
      };

      ctx.yield = preventNext;

      const ret = await el(ctx);
      handleReturnResponse(ret, res);
      if (shouldCallNext) {
        next();
      }
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
