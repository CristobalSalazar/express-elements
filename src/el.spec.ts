import { EPERM } from "constants";
import express from "express";
import request from "supertest";
import { el, provider } from ".";
import { Props } from "./app-types";

describe("Element", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(provider({}));
  });

  it("should convert when called with number", (done) => {
    app.get("/", el(200));
    app.get("/notfound", el(404));
    request(app).get("/").expect(200, done);
    request(app).get("/notfound").expect(404, done);
  });

  it("should convert when called with a string", (done) => {
    app.get("/", el("hello world"));
    request(app).get("/").expect("hello world", done);
  });

  it("should convert when passed element function", (done) => {
    app.get(
      "/",
      el((p) => p.req.url)
    );
    request(app).get("/").expect("/", done);
  });

  it("should convert when passed array of element functions", (done) => {
    let first = false;
    let second = false;

    const Component = el([
      () => {
        first = true;
      },
      () => {
        second = true;
      },
      (p) => p.req.url,
    ]);

    app.get("/", Component);

    request(app)
      .get("/")
      .then((res) => {
        expect(res.text).toBe("/");
        expect(first).toBe(true);
        expect(second).toBe(true);
        done();
      });
  });

  it("should convert when given array of element functions and data types", (done) => {
    const Component = el<Props<{ message: string }>>([
      (p) => {
        p.message = "hello world";
      },
      (p) => {
        expect(p.message).toBe("hello world");
      },
      404,
    ]);

    app.get("/", Component);

    request(app).get("/").expect(404, done);
  });
});
