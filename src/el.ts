import * as T from "./app-types";
import express from "express";
import { flatten } from "./flatten";

const DATA_KEY = "__component_data";

export function provider(props?: any): express.Handler {
  return function (req, res, next) {
    (req as any)[DATA_KEY] = props
      ? Object.assign({ req, res }, props)
      : { req, res };
    next();
  };
}

export function el<T extends T.Props = T.Props>(
  subject: T.ElementFn | T.Element<T> | object | number | string | null
) {
  if (Array.isArray(subject)) {
    return flatten(subject).map(convert);
  } else {
    return convert(subject);
  }
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
  return (req, res, next) => {
    handleReturn(data, res);
    next();
  };
}

function convertFn(elFn: T.ElementFn | T.MarkedElementFn): express.Handler {
  if (isCustomHandler(elFn)) return elFn;
  const fn: T.MarkedElementFn = async (req, res, next) => {
    try {
      const props = (req as any)[DATA_KEY] || { req, res };
      const ret = await elFn(props);
      handleReturn(ret, res);
      next();
    } catch (err) {
      next(err);
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
