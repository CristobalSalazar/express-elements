import { handler } from ".";
import express, { ErrorRequestHandler } from "express";
import request from "supertest";
import { createContext } from "./el";

describe("e2e", () => {
  it("should handle sync throws by passing to next", async () => {
    const app = express();
    let called = false;
    // error handler
    const errHandler: ErrorRequestHandler = (err, req, res, next) => {
      called = true;
      console.log("in error handler");
      res.status(500).json({ error: err.message });
    };

    const throwSync = handler([
      function ({ reply }) {
        throw new Error("woops!");
      },
    ]);

    app.get("/", throwSync);
    app.use(errHandler);
    const res = await request(app).get("/");
    expect(res.status).toBe(500);
    expect(called).toBe(true);
  });

  it("should handle async throws by passing to next", async () => {
    const app = express();
    let called = false;
    // error handler
    const errHandler: ErrorRequestHandler = (err, req, res, next) => {
      called = true;
      console.log("in error handler");
      res.status(500).json({ error: err.message });
    };

    const throwAsync = handler(async () => {
      throw new Error("woops!");
    });

    app.get("/", throwAsync);
    app.use(errHandler);

    const res = await request(app).get("/");
    expect(res.status).toBe(500);
    expect(called).toBe(true);
  });
});
