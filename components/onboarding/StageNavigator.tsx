import React, { useState } from 'react';

import classNames from 'classnames';

import { Text } from '../base';

interface StageNavigatorProps<TStageEnum> {
  currentStage: TStageEnum;
  stages: {
    value: TStageEnum;
    label: string;
  }[];
  enabledStages?: Set<TStageEnum>;
  visitedStages?: Set<TStageEnum>;
  onStageClick?: (stage: TStageEnum) => void;
}

export function StageNavigator<TStageEnum extends string>(
  props: StageNavigatorProps<TStageEnum>
) {
  const {
    currentStage,
    stages,
    onStageClick = () => {},
    enabledStages = new Set(),
    // visitedStages = new Set(),
  } = props;

  const [hoveredStage, setHoveredStage] = useState<TStageEnum | null>(null);

  // const currStageItem = stages.find((stage) => stage.value === currentStage);
  return (
    <>
      <div className="text-grayLight-80 flex w-full flex-col gap-4">
        {stages.map(({ value, label }, idx) => {
          const isCurrent = value === currentStage;
          // const isHovered = hoveredStage === value;
          const disabled = !enabledStages.has(value);
          // const visited = visitedStages.has(value);

          const cardStyles = classNames({
            'select-none': true,
            'cursor-pointer': !disabled,
          });

          const labelStyles = classNames({
            'px-4 border-l transition whitespace-nowrap': true,
            'border-transparent dark:border-black': !isCurrent,
            'border-grayLight-60 dark:border-white': isCurrent,
          });

          return (
            <div
              className={cardStyles}
              key={value}
              onClick={() => {
                if (disabled) return;
                onStageClick(value);
              }}
              onMouseEnter={() => {
                if (disabled) return;
                setHoveredStage(value);
              }}
              onMouseLeave={() => {
                if (disabled) return;
                setHoveredStage(null);
              }}
            >
              <Text
                color={isCurrent ? 'normal' : 'secondary'}
                className={labelStyles}
              >
                {label}
              </Text>
            </div>
          );
        })}
      </div>
    </>
  );
}
