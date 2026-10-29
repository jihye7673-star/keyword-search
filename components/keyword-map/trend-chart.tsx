"use client";

import { useEffect, useRef, useState } from "react";

const HEIGHT = 190;
const PAD = { left: 34, right: 14, top: 14, bottom: 26 };

function niceMax(v: number) {
  const step = v > 200 ? 50 : v > 60 ? 20 : v > 20 ? 10 : 5;
  return Math.max(step, Math.ceil(v / step) * step);
}

/**
 * 하루별 기사 수 선 차트. 하나의 계열이라 범례 없이 한 가지 색만 쓴다.
 * 마우스 또는 좌우 방향키로 날짜별 값을 보고, 같은 값을 표로도 볼 수 있다.
 */
export function TrendChart({
  title,
  axisLabels,
  fullLabels,
  values,
}: {
  title: string;
  axisLabels: string[];
  fullLabels: string[];
  values: number[];
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  const last = values.length - 1;
  const active = hover ?? last;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const update = () => setWidth(Math.round(el.clientWidth));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const max = niceMax(Math.max(...values));
  const iw = Math.max(width - PAD.left - PAD.right, 1);
  const ih = HEIGHT - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (iw * i) / last;
  const y = (v: number) => PAD.top + ih - (ih * v) / max;
  const points = values.map((v, i) => `${x(i)},${y(v)}`);
  const peak = values.indexOf(Math.max(...values));
  const total = values.reduce((a, b) => a + b, 0);

  function pointerIndex(e: React.PointerEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    return Math.max(0, Math.min(last, Math.round(((e.clientX - rect.left) / rect.width) * last)));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();
    setHover(Math.max(0, Math.min(last, active + (e.key === "ArrowRight" ? 1 : -1))));
  }

  return (
    <div className="flex flex-col gap-3">
      <dl className="flex flex-wrap gap-x-6 gap-y-2">
        {[
          ["오늘", `${values[last]}건`],
          ["최다", `${fullLabels[peak]} ${values[peak]}건`],
          ["2주 합계", `${total}건`],
        ].map(([label, value]) => (
          <div key={label} className="flex flex-col gap-0.5">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="text-lg font-semibold tracking-tight">{value}</dd>
          </div>
        ))}
      </dl>

      <div ref={wrapRef} className="relative w-full">
        {width > 0 && (
          <svg
            width={width}
            height={HEIGHT}
            viewBox={`0 0 ${width} ${HEIGHT}`}
            role="img"
            tabIndex={0}
            aria-label={`${title}. 좌우 방향키로 날짜를 이동할 수 있어요.`}
            className="block overflow-visible rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            onKeyDown={onKeyDown}
            onBlur={() => setHover(null)}
          >
            {[0, max / 2, max].map((v) => (
              <g key={v}>
                <line x1={PAD.left} x2={width - PAD.right} y1={y(v)} y2={y(v)} className="stroke-border" />
                <text x={PAD.left - 8} y={y(v) + 4} textAnchor="end" className="fill-muted-foreground text-[11px]">
                  {Math.round(v)}
                </text>
              </g>
            ))}
            {[0, Math.round(last / 2), last].map((i, k) => (
              <text
                key={i}
                x={x(i)}
                y={HEIGHT - 6}
                textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"}
                className="fill-muted-foreground text-[11px]"
              >
                {axisLabels[i]}
              </text>
            ))}
            <path d={`M${x(0)},${y(0)} L${points.join(" L")} L${x(last)},${y(0)} Z`} className="fill-foreground/10" />
            <polyline
              points={points.join(" ")}
              fill="none"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              className="stroke-foreground/70"
            />
            {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + ih} className="stroke-ring" />}
            <circle cx={x(active)} cy={y(values[active])} r={5} strokeWidth={2} className="fill-foreground stroke-card" />
            <rect
              x={PAD.left}
              y={PAD.top}
              width={iw}
              height={ih}
              fill="transparent"
              onPointerMove={(e) => setHover(pointerIndex(e))}
              onPointerLeave={() => setHover(null)}
            />
          </svg>
        )}
        {hover !== null && width > 0 && (
          <div
            className="pointer-events-none absolute z-10 flex -translate-x-1/2 -translate-y-full flex-col gap-px rounded-lg border bg-popover px-2.5 py-1.5 whitespace-nowrap text-popover-foreground shadow-md"
            style={{ left: Math.min(Math.max(x(hover), 50), width - 50), top: Math.max(y(values[hover]) - 10, 0) }}
          >
            <b className="text-sm">{values[hover]}건</b>
            <span className="text-xs text-muted-foreground">{fullLabels[hover]}</span>
          </div>
        )}
      </div>

      <details className="text-sm">
        <summary className="w-fit cursor-pointer rounded text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50">
          표로 보기
        </summary>
        <div className="mt-2 overflow-x-auto">
          <table className="min-w-56 border-collapse text-sm tabular-nums">
            <thead>
              <tr>
                <th className="py-1.5 pr-4 text-left font-medium text-muted-foreground">날짜</th>
                <th className="py-1.5 pr-4 text-left font-medium text-muted-foreground">기사 수</th>
              </tr>
            </thead>
            <tbody>
              {values.map((v, i) => (
                <tr key={fullLabels[i]} className="border-t">
                  <td className="py-1.5 pr-4">{fullLabels[i]}</td>
                  <td className="py-1.5 pr-4">{v}건</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
