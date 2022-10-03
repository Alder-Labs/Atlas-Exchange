import { useMemo } from 'react';

import { Select } from '../base';

export type TradeUnit = 'from' | 'to';

interface SelectTradeUnitProps {
  fromLabel: string;
  toLabel: string;
  value: TradeUnit;
  onChange: (val: TradeUnit) => void;
}

export function SelectTradeUnit(props: SelectTradeUnitProps) {
  const { value, onChange, fromLabel, toLabel } = props;

  const options: { label: string; value: TradeUnit }[] = useMemo(
    () => [
      { value: 'from', label: fromLabel },
      { value: 'to', label: toLabel },
    ],
    [fromLabel, toLabel]
  );

  return (
    <Select<TradeUnit>
      size="sm"
      value={value}
      onSelect={(newVal) => {
        if (newVal) {
          onChange(newVal);
        }
      }}
      options={options}
    />
  );
}
