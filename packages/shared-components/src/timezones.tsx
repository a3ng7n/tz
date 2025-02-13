import { useShallow } from "zustand/react/shallow";
import { useUIState } from "./store";
import { useRef } from "react";

const tzs: number[] = [];
for (let i = -12; i <= 12; i++) tzs.push(i);

export function Timezones() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { center, bounds, canvasSize } = useUIState(
    useShallow((state) => ({
      mapZoom: state.mapZoom,
      center: state.center,
      bounds: state.bounds,
      canvasSize: state.canvasSize,
    })),
  );

  const widthDeg = Math.abs(bounds[1].lng - bounds[0].lng);
  const degPerPixel = widthDeg / canvasSize.width;
  const tzDeg = 360 / 24;
  const tzPix = tzDeg / degPerPixel;

  console.log("center", center, containerRef.current?.getClientRects());
  return (
    <div
      ref={containerRef}
      className="relative flex flex-row overflow-hidden w-full flex-none"
    >
      {tzs.map((v) => {
        const width = tzPix / (v > -12 && v < 12 ? 1 : 2);

        return (
          <div className="border overflow-hidden shrink-0" style={{ width }}>
            {v}
          </div>
        );
      })}
    </div>
  );
}
