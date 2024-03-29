import {
  forwardRef,
  InputHTMLAttributes,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

import clsx from 'clsx';
import { Rifm } from 'rifm';
import resolveConfig from 'tailwindcss/resolveConfig';

import tailwindConfig from '../../tailwind.config';

const fullConfig = resolveConfig(tailwindConfig);

const numberAccept = /[\d.]+/g;

function getFormatInputValue(coinId?: string) {
  const decimalPlaces = coinId === 'USD' ? 2 : 8;
  return (nStr: string) => {
    nStr += '';
    let x = nStr.replace(/[^\d.]/g, '').split('.');
    let x1 = x[0];
    let x2 = x.length > 1 ? '.' + x[1] : '';
    let rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2.slice(0, decimalPlaces + 1);
  };
}

function measureText(pText: string, pFont: string) {
  var lDiv: HTMLDivElement | null = document.createElement('div');

  document.body.appendChild(lDiv);

  lDiv.style.font = pFont;
  lDiv.style.position = 'absolute';
  lDiv.style.visibility = 'hidden';
  lDiv.style.pointerEvents = 'none';

  lDiv.textContent = pText;

  var lResult = {
    width: lDiv.clientWidth,
    height: lDiv.clientHeight,
  };

  document.body.removeChild(lDiv);
  lDiv = null;

  return lResult.width;
}

function getFontSizeDefault(valueLength: number): string {
  if (valueLength < 10) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['5xl'];
  } else if (valueLength < 14) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['4xl'];
  } else if (valueLength < 18) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['3xl'];
  } else {
    // @ts-ignore
    return fullConfig.theme?.fontSize['2xl'];
  }
}

export function getFontSizeForBuySell(valueLength: number): string {
  if (valueLength < 5) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['6xl'];
  } else if (valueLength < 6) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['5xl'];
  } else if (valueLength < 8) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['4xl'];
  } else if (valueLength < 12) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['3xl'];
  } else if (valueLength < 16) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['2xl'];
  } else if (valueLength < 18) {
    // @ts-ignore
    return fullConfig.theme?.fontSize['xl'];
  } else {
    // @ts-ignore
    return fullConfig.theme?.fontSize['md'];
  }
}

interface BigNumberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  active?: boolean;
  coinId?: string;
  onValueChange?: (value: string) => void;
  getFontSize?: (valueLength: number) => string;
}

// eslint-disable-next-line react/display-name
export const BigNumberInput = forwardRef<HTMLInputElement, BigNumberInputProps>(
  (props: BigNumberInputProps, ref) => {
    const {
      value,
      placeholder,
      onFocus,
      onBlur,
      active,
      coinId,
      onValueChange,
      getFontSize = getFontSizeDefault,
      ...rest
    } = props;

    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    const [focused, setFocused] = useState(false);

    const val = focused ? value?.toString() : value?.toString() || placeholder;

    const formatInputValue = getFormatInputValue(coinId);
    const renderedValue = formatInputValue(val ?? '');

    const renderedFontSize = getFontSize(renderedValue.length);
    const width = measureText(
      renderedValue,
      // @ts-ignore
      `${renderedFontSize} ${fullConfig.theme?.fontFamily['sans']}`
    );

    const inputStyles = clsx({
      'outline-none bg-transparent font-sans': true,
      // Placeholder, caret
      'placeholder:text-grayLight-70 caret-grayLight-70': !focused,
      'dark:placeholder:text-grayDark-70': true,
      'placeholder:text-black caret-black dark:caret-brand-500': focused,
    });

    const containerStyles = clsx({
      'flex max-w-full overflow-hidden font-sans': true,

      'justify-center h-full items-center cursor-text': true,
      // 'bg-brand-500': true,
      // Text
      'text-grayLight-70 dark:text-grayDark-70': !focused && !value,
      'text-black dark:text-white': !focused && value,
      'text-black dark:text-brand-500': focused,
    });

    return (
      <div
        className={containerStyles}
        style={{
          fontSize: renderedFontSize,
        }}
        onClick={() => {
          innerRef?.current?.focus();
        }}
      >
        {coinId === 'USD' && <span className="select-none">$</span>}
        <Rifm
          accept={numberAccept}
          format={formatInputValue}
          value={value as string}
          onChange={(val) => {
            const stripped = val.replace(/[^\d.]/g, '');
            onValueChange?.(stripped);
          }}
        >
          {({ value, onChange }) => (
            <>
              <input
                {...rest}
                ref={innerRef}
                value={value}
                onKeyDown={(e) => {
                  if (e.key === ',') {
                    e.preventDefault();
                  }
                }}
                onChange={(e) => {
                  const stripped = e.target.value.replace(/[^\d.]/g, '');
                  const [head] = stripped.split('.');
                  if (head.length < 11) {
                    onChange(e);
                  }
                }}
                style={{ width, minWidth: 1 }}
                className={inputStyles}
                placeholder={!focused ? placeholder : ''}
                onFocus={(e) => {
                  setFocused(true);
                  onFocus?.(e);
                }}
                onBlur={(e) => {
                  setFocused(false);
                  onBlur?.(e);
                }}
              />
            </>
          )}
        </Rifm>
        {/*{coinId !== 'USD' && (*/}
        {/*  <span className="ml-1 select-none">{`${coinId}`}</span>*/}
        {/*)}*/}
      </div>
    );
  }
);
