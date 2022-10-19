import { useState, useEffect } from 'react';

/**
 * NOTE: This hook will cause a re-render every second by default.
 * Only use this hook if you need to update the UI every [timeInterval] based on the current date.
 */
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
