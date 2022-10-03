import React from 'react';

import { faArrowUp, faArrowDown } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { Text } from '../base';

interface DisplayMarketChangeProps {
  changeFraction: number;
}

export function DisplayMarketChange(props: DisplayMarketChangeProps) {
  const { changeFraction } = props;
  return changeFraction * 100 < 0 ? (
    <div className={'flex flex-row'}>
      <Text color={'red'} size="sm">
        {(changeFraction * 100).toFixed(2)}%
      </Text>
      <FontAwesomeIcon
        icon={faArrowDown}
        className={'text-redLight dark:text-redDark ml-1 w-2.5 -rotate-45'}
      />
    </div>
  ) : (
    <div className={'flex flex-row'}>
      <Text color={'green'} size="sm">
        {(changeFraction * 100).toFixed(2)}%
      </Text>
      <FontAwesomeIcon
        icon={faArrowUp}
        className={'text-greenLight dark:text-greenDark ml-1 w-2.5 rotate-45'}
      />
    </div>
  );
}
