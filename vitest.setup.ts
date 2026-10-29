import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// globals: false 이므로 Testing Library 자동 cleanup이 걸리지 않는다.
afterEach(cleanup);

// jsdom 에는 ResizeObserver 가 없다. 차트와 키워드 맵의 크기 측정은 실제 브라우저에서 확인한다.
// vi.stubGlobal 은 테스트 파일의 unstubAllGlobals 에 지워지므로 전역에 직접 둔다.
class NoopResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = NoopResizeObserver;
