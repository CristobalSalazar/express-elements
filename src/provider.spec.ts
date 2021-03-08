import express from "express";
import async from "async";
import request from "supertest";
import { el, provider } from "./el";

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

    const ServiceProvider = provider(services);

    type Data = typeof services;

    app.use(ServiceProvider);
    app.get(
      "/",
      el<Data>([
        (props) => {
          expect(props.data.service).toBeDefined();
          expect(props.data.service).toBe(services.service);
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
