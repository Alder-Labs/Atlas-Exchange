import clsx from 'clsx';

import { DurationInterval, DURATION_INTERVALS } from '../../lib/duration';
import { Text } from '../base';

export interface DurationIntervalSelectorProps {
  value: DurationInterval;
  onChange: (interval: DurationInterval) => void;
}

export const DurationIntervalSelector = (
  props: DurationIntervalSelectorProps
) => {
  const { value, onChange } = props;

  const getBtnStyle = (interval: DurationInterval) => {
    return clsx({
      'py-2 mx-3 border-b-2 outline-none select-none translate-y-[2px]': true,
      'border-textAccent text-textAccent': interval === value,
      'border-transparent text-grayLight-70 dark:text-grayDark-70':
        interval !== value,
    });
  };

  return (
    <div className="flex flex-row">
      {DURATION_INTERVALS.map((duration) => (
        <div
          key={duration}
          className="cursor-pointer"
          onClick={() => onChange(duration)}
        >
          <Text color="nocolor" className={getBtnStyle(duration)}>
            {duration}
          </Text>
        </div>
      ))}
    </div>
  );
};
