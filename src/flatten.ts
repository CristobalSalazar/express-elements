export function flatten<T = any, K = T extends Array<any> ? never : any>(
  arr: T[],
  result = [] as K[]
) {
  for (let i = 0, length = arr.length; i < length; i++) {
    const value: any = arr[i];
    if (Array.isArray(value)) {
      flatten(value, result);
    } else {
      result.push(value);
    }
  }
  return result;
}
