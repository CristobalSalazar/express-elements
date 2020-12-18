import { flatten } from "./flatten";

describe("flatten", () => {
  it("should return empty array when given an empty array", () => {
    expect(flatten([])).toStrictEqual([]);
  });

  it("should return empty array when passed undefined or null", () => {
    expect(flatten(null)).toStrictEqual([]);
    expect(flatten(undefined)).toStrictEqual([]);
  });

  it("should wrap non array values in array", () => {
    // @ts-expect-error
    expect(flatten(3)).toStrictEqual([3]);
    // @ts-expect-error
    expect(flatten("hello")).toStrictEqual(["hello"]);

    function testfn() {}
    // @ts-expect-error
    expect(flatten(testfn)).toStrictEqual([testfn]);
  });

  it("should flatten items", () => {
    // prettier-ignore
    expect(flatten([1, [2, 3, [4, 5], [6, 7], [8, 9], [10]]])).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  });
});
