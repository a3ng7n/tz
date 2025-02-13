import { useShallow } from "zustand/react/shallow";
import { useUIState } from "./store";
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

const tzWidthDeg: number = 360 / 24;
const tzs: { offset: number; timeZone: string; bounds: [number, number] }[] =
  [];
for (let i = 0; i <= 24; i++) {
  const offset = i - 12;
  if (offset === -12) {
    tzs.push({
      offset,
      timeZone: offsetToTzString(offset),
      bounds: [-180, -180 + tzWidthDeg / 2],
    });
  } else if (offset === 12) {
    tzs.push({
      offset,
      timeZone: offsetToTzString(offset),
      bounds: [tzs[i - 1].bounds[1], 180],
    });
  } else {
    tzs.push({
      offset,
      timeZone: offsetToTzString(offset),
      bounds: [tzs[i - 1].bounds[1], tzs[i - 1].bounds[1] + tzWidthDeg],
    });
  }
}

/**
 * calculate time in a different location by
 * its offset
 * @param d - current date/time
 * @param offset - number of hours to offset `d` by
 * @returns a new `Date` of `d` offset by `offset`
 */
function calcTime(d: Date, offset: number) {
  // create Date object for current location

  // get UTC time in msec
  var utc = d.getTime();

  // create new Date object for different city
  // using supplied offset
  var nd = new Date(utc + 3600000 * offset);

  return nd;
}

export function Timezones() {
  const { bounds, canvasSize, time } = useUIState(
    useShallow((state) => ({
      mapZoom: state.mapZoom,
      center: state.center,
      bounds: state.bounds,
      canvasSize: state.canvasSize,
      time: state.time,
    })),
  );

  // calculate the canvas width's current ratio of pixels to degree
  const pxPerDeg = useMemo(() => {
    const widthDeg = Math.abs(bounds[1].lng - bounds[0].lng);
    return canvasSize.width / widthDeg;
  }, [canvasSize, bounds]);

  const incTzs = useMemo(
    () =>
      tzs
        // find only the timezones that have any part within the canvas
        .filter(
          (tz) =>
            (tz.bounds[0] > bounds[0].lng || tz.bounds[1] > bounds[0].lng) &&
            (tz.bounds[0] < bounds[1].lng || tz.bounds[1] < bounds[1].lng),
        )
        // recalculate their bounds if they are clipped by the canvas
        .map((tz) => {
          const tzStart =
            tz.bounds[0] <= bounds[0].lng ? bounds[0].lng : tz.bounds[0];
          const tzEnd =
            tz.bounds[1] >= bounds[1].lng ? bounds[1].lng : tz.bounds[1];
          return { ...tz, bounds: [tzStart, tzEnd] };
        })
        // calculate the width in pixels for each timezone
        .map((tz) => ({
          ...tz,
          width: Math.abs(tz.bounds[1] - tz.bounds[0]) * pxPerDeg,
        })),
    [tzs, bounds, pxPerDeg],
  );

  return (
    <div className="relative flex flex-row overflow-hidden w-full flex-none pointer-events-none">
      {incTzs.map((tz) => {
        const offsetTime = calcTime(time, tz.offset);
        return (
          <div
            key={tz.offset}
            className="border overflow-hidden shrink-0 text-center align-middle text-nowrap"
            style={{ width: tz.width }}
          >
            {offsetTime.toLocaleTimeString(navigator.language, {
              timeZone: tz.timeZone,
            })}
          </div>
        );
      })}
    </div>
  );
}
