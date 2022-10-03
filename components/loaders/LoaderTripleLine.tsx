import { HTMLAttributes } from 'react';

import 'react-loading-skeleton/dist/skeleton.css';

import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';
import { Title, Text } from '../base';

const fullConfig = resolveConfig(tailwindConfig);

// @ts-ignore
const height = fullConfig.theme?.height['4'];

interface LoaderDoubleLineProps extends HTMLAttributes<HTMLDivElement> {}

export function LoaderTripleLine(props: LoaderDoubleLineProps) {
  const { className, ...rest } = props;

  return (
    <div {...rest} className={className}>
      <div>
        <Title
          order={4}
          className="font-bold"
          isLoading={true}
          loadingWidth={'12rem'}
        >
          Placeholder
        </Title>
        <div className="h-2"></div>
        <Text
          size="md"
          color="secondary"
          isLoading={true}
          loadingWidth={'16rem'}
        >
          Placeholder
        </Text>
      </div>
    </div>
  );
}
