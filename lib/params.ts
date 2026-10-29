/** 경로의 한글 키워드를 되돌린다. 이미 풀려 있으면 그대로 쓴다. */
export function decodeParam(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
