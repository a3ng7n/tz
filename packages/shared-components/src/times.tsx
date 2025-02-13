import { useEffect } from "react";
import { useUIState } from "./store";
import { useShallow } from "zustand/react/shallow";

export function Times() {
  const { time, setTime } = useUIState(
    useShallow((state) => ({ time: state.time, setTime: state.setTime })),
  );

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date(Date.now())), 1000);

    return () => clearInterval(interval);
  });

  return <>{time.toString()}</>;
}
