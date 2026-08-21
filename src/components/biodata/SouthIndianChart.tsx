"use client";

import { PLANETS } from "@/lib/biodata";

/** houseIndex (0–11) with CSS grid column/row (1-based) */
const HOUSE_CELLS: { house: number; col: number; row: number }[] = [
  { house: 11, col: 1, row: 1 }, // 12
  { house: 0, col: 2, row: 1 }, // 1
  { house: 1, col: 3, row: 1 }, // 2
  { house: 2, col: 4, row: 1 }, // 3
  { house: 10, col: 1, row: 2 }, // 11
  { house: 3, col: 4, row: 2 }, // 4
  { house: 9, col: 1, row: 3 }, // 10
  { house: 4, col: 4, row: 3 }, // 5
  { house: 8, col: 1, row: 4 }, // 9
  { house: 7, col: 2, row: 4 }, // 8
  { house: 6, col: 3, row: 4 }, // 7
  { house: 5, col: 4, row: 4 }, // 6
];

export type ChartDragPayload = {
  code: string;
  fromHouse?: number;
  chartId?: "rasi" | "amsam";
};

export type ChartDropTarget = {
  chartId: "rasi" | "amsam";
  house: number;
};

type Props = {
  label: string;
  chartId?: "rasi" | "amsam";
  houses: string[][];
  onChange?: (houses: string[][]) => void;
  editable?: boolean;
  showPalette?: boolean;
  activeDrag?: ChartDragPayload | null;
  dropTarget?: ChartDropTarget | null;
  onPlanetPointerDown?: (
    e: React.PointerEvent,
    payload: ChartDragPayload,
  ) => void;
  onPlanetTapRemove?: (house: number, code: string) => void;
};

function ensureHouses(houses: string[][]): string[][] {
  return Array.from({ length: 12 }, (_, i) =>
    Array.isArray(houses[i]) ? [...houses[i]] : [],
  );
}

export function findChartDropTarget(
  x: number,
  y: number,
): ChartDropTarget | null {
  let cur: Element | null = document.elementFromPoint(x, y);
  while (cur) {
    if (cur instanceof HTMLElement && cur.dataset.houseIndex != null) {
      const chartId = cur.dataset.chartId;
      const house = Number(cur.dataset.houseIndex);
      if (
        (chartId === "rasi" || chartId === "amsam") &&
        Number.isFinite(house)
      ) {
        return { chartId, house };
      }
    }
    cur = cur.parentElement;
  }
  return null;
}

export function placePlanetInChart(
  houses: string[][],
  houseIndex: number,
  code: string,
  fromHouse?: number,
): string[][] {
  const next = ensureHouses(houses);
  if (fromHouse != null && fromHouse >= 0 && fromHouse < 12) {
    next[fromHouse] = next[fromHouse].filter((p) => p !== code);
  }
  for (let i = 0; i < 12; i++) {
    if (i === houseIndex) continue;
    next[i] = next[i].filter((p) => p !== code);
  }
  if (!next[houseIndex].includes(code)) {
    next[houseIndex] = [...next[houseIndex], code];
  }
  return next;
}

export function removePlanetFromChart(
  houses: string[][],
  houseIndex: number,
  code: string,
): string[][] {
  const next = ensureHouses(houses);
  next[houseIndex] = next[houseIndex].filter((p) => p !== code);
  return next;
}

export function SouthIndianChart({
  label,
  chartId,
  houses,
  editable = true,
  showPalette = true,
  activeDrag = null,
  dropTarget = null,
  onPlanetPointerDown,
  onPlanetTapRemove,
}: Props) {
  const data = ensureHouses(houses);

  return (
    <div className="font-tamil w-full max-w-[280px] sm:max-w-[320px]">
      {editable && showPalette ? (
        <div className="mb-3">
          <p className="mb-2 text-center text-xs font-medium text-[var(--biodata-blue)]">
            கிரகத்தை இழுத்து வீட்டில் விடவும்
          </p>
          <div className="flex flex-wrap justify-center gap-1.5">
            {PLANETS.map((p) => (
              <button
                key={p.code}
                type="button"
                title={p.label}
                onPointerDown={(e) =>
                  onPlanetPointerDown?.(e, { code: p.code })
                }
                className={`min-h-10 min-w-10 touch-none rounded border px-2 py-1.5 text-sm font-semibold transition ${
                  activeDrag?.code === p.code && activeDrag.fromHouse == null
                    ? "border-[var(--biodata-red)] bg-[var(--biodata-red)] text-white opacity-60"
                    : "border-[var(--biodata-blue)] bg-white text-[var(--biodata-red)] hover:bg-[var(--biodata-blue)]/5"
                }`}
              >
                {p.code}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="relative grid aspect-square w-full grid-cols-4 grid-rows-4 border-2 border-[var(--biodata-red)]"
        role="grid"
        aria-label={`${label} chart`}
      >
        <div
          className="col-start-2 col-end-4 row-start-2 row-end-4 flex items-center justify-center border border-[var(--biodata-red)] bg-[var(--biodata-cream)]"
          style={{ gridColumn: "2 / 4", gridRow: "2 / 4" }}
        >
          <span className="text-lg font-bold text-[var(--biodata-red)] sm:text-xl">
            {label}
          </span>
        </div>

        {HOUSE_CELLS.map(({ house, col, row }) => {
          const planets = data[house] || [];
          const isDropTarget =
            !!dropTarget &&
            dropTarget.chartId === chartId &&
            dropTarget.house === house;
          return (
            <div
              key={house}
              data-house-index={house}
              data-chart-id={chartId}
              style={{ gridColumn: col, gridRow: row }}
              className={`relative flex min-h-[44px] flex-col items-center justify-start gap-0.5 overflow-hidden border border-[var(--biodata-red)] bg-white p-1 text-center transition ${
                isDropTarget
                  ? "bg-red-50 ring-2 ring-inset ring-[var(--biodata-gold)]"
                  : ""
              } ${editable && activeDrag ? "cursor-copy" : ""}`}
              aria-label={`House ${house + 1}`}
            >
              <span className="pointer-events-none absolute right-0.5 top-0 text-[9px] text-[var(--biodata-blue)]/40">
                {house + 1}
              </span>
              <div className="flex flex-wrap items-start justify-center gap-0.5 pt-2">
                {planets.map((code) =>
                  editable ? (
                    <span
                      key={code}
                      role="button"
                      tabIndex={0}
                      onPointerDown={(e) =>
                        onPlanetPointerDown?.(e, {
                          code,
                          fromHouse: house,
                          chartId,
                        })
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlanetTapRemove?.(house, code);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.stopPropagation();
                          onPlanetTapRemove?.(house, code);
                        }
                      }}
                      className={`touch-none rounded bg-[var(--biodata-red)]/10 px-0.5 text-[11px] font-bold leading-tight text-[var(--biodata-red)] hover:bg-[var(--biodata-red)] hover:text-white sm:text-xs ${
                        activeDrag?.code === code &&
                        activeDrag.fromHouse === house &&
                        activeDrag.chartId === chartId
                          ? "opacity-40"
                          : ""
                      }`}
                      title="Drag to move · Tap to remove"
                    >
                      {code}
                    </span>
                  ) : (
                    <span
                      key={code}
                      className="px-0.5 text-[11px] font-bold leading-tight text-[var(--biodata-red)] sm:text-xs"
                    >
                      {code}
                    </span>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
