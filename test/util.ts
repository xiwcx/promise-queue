export const createTimeoutPromise = (
  ms: number,
  val?: string
): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(val ?? String(ms));
    }, ms);
  });
};
