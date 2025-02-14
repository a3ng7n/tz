import { useShallow } from "zustand/react/shallow";
import { useUIState } from "./ui-store";
import { useMemo } from "react";

/**
 * converts a numerical offset into one that `DateTimeFormat` is happy with
 * examples:
 *   -3 => "-03"
 *   0 => "UTC"
 *   9 => "+09"
 *   11 => "+11"
 * @param offset - hour offset
 */
const offsetToTzString = (offset: number) => {
  if (offset == 0) return "UTC";
  const tzString = String(Math.abs(offset)).padStart(2, "0");
  if (offset > 0) {
    return `+${tzString}`;
  } else {
    return `-${tzString}`;
  }
};

const tileSizePix: number = 512;
const tzWidthDeg: number = 360 / 24;
interface TZ {
  offset: number;
  bounds: [number, number];
  formatter: Intl.DateTimeFormat;
}
const tzs: TZ[] = [];
for (let i = 0; i <= 24; i++) {
  const offset = i - 12;
  if (offset === -12) {
    tzs.push({
      offset,
      bounds: [-180, -180 + tzWidthDeg / 2],
      formatter: new Intl.DateTimeFormat(navigator.language, {
        timeZone: offsetToTzString(offset),
        timeStyle: "short",
        hour12: false,
      }),
    });
  } else if (offset === 12) {
    tzs.push({
      offset,
      bounds: [tzs[i - 1].bounds[1], 180],
      formatter: new Intl.DateTimeFormat(navigator.language, {
        timeZone: offsetToTzString(offset),
        timeStyle: "short",
        hour12: false,
      }),
    });
  } else {
    tzs.push({
      offset,
      bounds: [tzs[i - 1].bounds[1], tzs[i - 1].bounds[1] + tzWidthDeg],
      formatter: new Intl.DateTimeFormat(navigator.language, {
        timeZone: offsetToTzString(offset),
        timeStyle: "short",
        hour12: false,
      }),
    });
  }
}

const mod = (n: number, d: number) => ((n % d) + d) % d;
const constrain = (n: number, min: number, max: number) => {
  const range = Math.abs(max - min);
  return mod(n - min, range) + min;
};

export function Timezones() {
  const { mapZoom, bounds, canvasSize, time } = useUIState(
    useShallow((state) => ({
      mapZoom: state.mapZoom,
      center: state.center,
      bounds: state.bounds,
      canvasSize: state.canvasSize,
      time: state.time,
    })),
  );

  const widthTiles = canvasSize.width / tileSizePix / Math.pow(2, mapZoom);
  const widthDeg = widthTiles * 360;

  const boundsCon = bounds.map((b) => ({
    ...b,
    lng: constrain(b.lng, -180, 180),
  }));

  // calculate the canvas width's current ratio of pixels to degree
  const pxPerDeg = useMemo(() => {
    return canvasSize.width / widthDeg;
  }, [canvasSize, bounds]);

  const initTz = tzs.find(
    (tz) => tz.bounds[0] <= boundsCon[0].lng && tz.bounds[1] > boundsCon[0].lng,
  );

  const incTzs: (TZ & { width: number })[] = [];
  if (initTz !== undefined) {
    let lng0 = bounds[0].lng;
    const lngLimit = bounds[0].lng + widthDeg;
    let idx = initTz.offset + 12;

    while (lng0 <= lngLimit) {
      const tz = tzs[idx];

      const bound0 = lng0;

      const tzNomRange = Math.abs(tz.bounds[1] - constrain(bound0, -180, 180));

      const bound1abs = tzNomRange + lng0;

      const bound1 = bound1abs > lngLimit ? lngLimit : bound1abs;

      incTzs.push({
        ...tz,
        bounds: [bound0, bound1],
        width: Math.abs(bound1 - bound0) * pxPerDeg,
      });

      lng0 = lng0 + tzNomRange;
      idx = (idx + 1) % 25;
    }
  }

  return (
    <div className="relative flex flex-row overflow-hidden w-full flex-none pointer-events-none">
      {incTzs.map((tz, idx) => {
        return (
          <div
            key={`tz-${idx}`}
            className="border overflow-hidden shrink-0 text-center align-middle text-nowrap"
            style={{ width: tz.width }}
          >
            {tz.formatter.format(time)}
          </div>
        );
      })}
    </div>
  );
}
