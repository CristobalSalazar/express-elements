import { handleReturnResponse } from "./el";

describe("handle return", () => {
  let res: any;

  beforeEach(() => {
    res = {
      json: jest.fn((val) => {}),
      send: jest.fn((val) => {}),
      sendStatus: jest.fn((val) => {}),
      end: jest.fn(),
    };
  });

  it("should throw when error is passed", () => {
    expect(() => handleReturnResponse(new Error("woops"), res)).toThrowError();
  });

  it("should call res.json when obect is passed", () => {
    const data = { hello: "world" };
    handleReturnResponse(data, res);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith(data);
  });

  it("should call res.end when null is passed", () => {
    handleReturnResponse(null, res);
    expect(res.end).toBeCalledTimes(1);
    expect(res.end).toBeCalledTimes(1);
  });

  it("should call res.sendStatus when number is passed", () => {
    handleReturnResponse(1, res);
    expect(res.sendStatus).toBeCalledTimes(1);
    expect(res.sendStatus).toBeCalledWith(1);
  });

  it("should call res.send when string is passed", () => {
    handleReturnResponse("test", res);
    expect(res.send).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith("test");
  });

  it("should call res.send when boolean is passed", () => {
    handleReturnResponse(true, res);
    expect(res.send).toBeCalledTimes(1);
    expect(res.send).toBeCalledWith(true);
  });
});
