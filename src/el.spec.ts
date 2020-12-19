import express from "express";
import request from "supertest";
import { el, provider } from ".";

describe("el()", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(provider());
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

  it("should handle nested elements", (done) => {
    const element = el(
      el([
        (p) => {
          p.data.count = 0;
        },
        (p) => {
          p.data.count++;
        },
      ]),
      [
        el((p) => {
          p.data.count++;
        }),
        [
          el((p) => {
            p.data.count++;
          }),
        ],
      ],
      el((p) => {
        p.data.count++;
        return String(p.data.count);
      })
    );

    app.get("/", element);
    request(app)
      .get("/")
      .then((res) => {
        expect(res.text).toBe("4");
      })
      .catch(fail)
      .finally(done);
  });

  it("should automatically call next when not accessed", (done) => {
    const element = el(
      (p) => (p.data.message = "hello"),
      (p) => p.data.message
    );
    app.get("/", element);
    request(app).get("/").expect("hello", done);
  });

  it("should not call next when accessed", (done) => {
    // Note: need to destructure next to trigger the getter
    const element = el(({ next, res }) => {
      setTimeout(() => {
        res.send("hello");
        next();
      }, 100);
    });
    app.get("/", element);
    app.get("/", el(500));
    request(app).get("/").expect("hello", done);
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
      ({ req }) => req.url,
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

  it("data should have stable reference", (done) => {
    class MyClass {}
    let instance: MyClass;
    const Component = el([
      ({ data }) => {
        data.instance = new MyClass();
        instance = data.instance;
      },
      ({ data }) => {
        expect(data.instance).toBe(instance);
        return null;
      },
    ]);

    app.get("/", Component);
    request(app).get("/").expect(200, done);
  });

  it("should convert multiple arguments", (done) => {
    const element = el(
      (p) => {
        p.data.message = "hello";
      },
      (p) => {
        expect(p.data.message).toBe("hello");
      },
      404
    );

    app.get("/", element);
    request(app).get("/").expect(404, done);
  });

  it("should convert when given array of mixed data types", (done) => {
    const ComponentStatus = el([
      ({ data }) => {
        data.message = "hello world";
      },
      404,
    ]);

    app.get("/", ComponentStatus);

    request(app).get("/").expect(404, done);
  });
});
