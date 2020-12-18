import express from "express";
import async from "async";
import request from "supertest";
import { el, provider } from "./el";
import { Element, Props } from "./app-types";

describe("Components", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
  });

  it("should reference same instance of props provided down", (done) => {
    let constructorCallCount = 0;
    class Service {
      constructor() {
        constructorCallCount++;
      }
    }
    const services = {
      service: new Service(),
    };

    type AppProps = Props<typeof services>;
    const ServiceProvider = provider(services);

    app.use(ServiceProvider);
    app.get(
      "/",
      el<AppProps>([
        (props) => {
          expect(props.service).toBeDefined();
          expect(props.service).toBe(services.service);
        },
      ])
    );
    async.series(
      [
        (cb) => request(app).get("/").end(cb),
        (cb) => request(app).get("/").end(cb),
        (cb) => request(app).get("/").end(cb),
        (cb) => request(app).get("/").end(cb),
      ],
      () => {
        expect(constructorCallCount).toBe(1);
        done();
      }
    );
  });
});
