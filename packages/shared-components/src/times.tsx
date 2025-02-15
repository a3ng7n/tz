import { useEffect } from "react";
import { useUIState } from "./ui-store";
import { useShallow } from "zustand/react/shallow";

export function Times() {
  const { time, setTime } = useUIState(
    useShallow((state) => ({ time: state.time, setTime: state.setTime })),
  );

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date(Date.now())), 1000);

    return () => clearInterval(interval);
  });

  return (
    <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight self-center">
      {time.toString()}
    </h3>
  );
}
