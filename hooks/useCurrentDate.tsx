import { useState, useEffect } from "react";

// State representing the current date
// Updates every second by default
export function useCurrentDate(
  props: { updateInterval?: number } | void
): Date {
  const [currentDate, setCurrentDate] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, props?.updateInterval || 1000);
    return () => clearInterval(interval);
  }, [props?.updateInterval]);

  return currentDate;
}
