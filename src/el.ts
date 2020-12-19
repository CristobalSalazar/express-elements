import * as T from "./app-types";
import express from "express";
import { flatten } from "./flatten";

const DATA_KEY = "__component_data";

export function provider(props: any = {}): express.Handler {
  return function (req, res, next) {
    (req as any)[DATA_KEY] = props;
    next();
  };
}

export function el<T = any>(
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
    return convertFn(data as T.ElementFn);
  } else {
    return convertData(data);
  }
}

function convertData(
  data: object | string | number | boolean | null
): express.Handler {
  const fn: T.MarkedElementFn = (req, res, next) => {
    handleReturn(data, res);
    next();
  };
  fn.__isComponent = true;
  return fn;
}

function convertFn(elFn: T.ElementFn | T.MarkedElementFn): express.Handler {
  if (isCustomHandler(elFn)) return elFn;
  let shouldCallNext = true;
  const fn: T.MarkedElementFn = async (req, res, next) => {
    try {
      const data = (req as any)[DATA_KEY]; // contains props from upstream
      const props = {
        req,
        res,
        get next() {
          shouldCallNext = false;
          return next;
        },
        data,
      };
      const ret = await elFn(props);
      handleReturn(ret, res);
      if (shouldCallNext) next();
    } catch (err) {
      next(err); // this seems fine...
    }
  };
  fn.__isComponent = true;
  return fn;
}

export function handleReturn(returnValue: any, res: express.Response) {
  if (returnValue instanceof Error) throw returnValue;
  if (returnValue === null) return res.end();
  switch (typeof returnValue) {
    case "undefined":
      return;
    case "object":
      return res.json(returnValue);
    case "number":
      return res.sendStatus(returnValue);
    default:
      return res.send(returnValue);
  }
}
