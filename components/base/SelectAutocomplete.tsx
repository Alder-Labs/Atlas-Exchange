import { Fragment, useMemo, useRef, useState } from 'react';

import { Combobox, Transition } from '@headlessui/react';
import clsx from 'clsx';

const UpDownArrow: React.FC = () => {
  return (
    <svg
      className="h-5 w-5 text-grayLight-60"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
        clipRule="evenodd"
      ></path>
    </svg>
  );
};

type OptionType<T> = { label: string; value: T; searchKey?: string };

interface SelectProps<T> {
  options: OptionType<T>[];
  value: T | null;
  onSelect?: (selectedValue: T | null) => void;
  className?: string;
  placeholder?: string;

  renderOption?: (
    value: T,
    state: { active: boolean; selected: boolean; disabled: boolean }
  ) => React.ReactNode;
  renderSelected?: (value: T) => React.ReactNode;
  renderPlaceholder?: () => React.ReactNode;
}

export function SelectAutocomplete<T extends string>(props: SelectProps<T>) {
  const {
    options,
    value,
    onSelect = () => {},
    className,
    placeholder,
    renderOption,
  } = props;
  const [query, setQuery] = useState('');

  const valueToLabel = (value: T | null) => {
    if (value === null) {
      return '';
    }

    return options.find((x) => x.value === value)?.label;
  };

  const styles = clsx({
    'w-auto': !className,
    [`${className}`]: className,
  });

  const filteredOptions = useMemo(() => {
    return query === ''
      ? options
      : options.filter((option) =>
          (option.searchKey ?? option.label)
            .toLowerCase()
            .replace(/\s+/g, '')
            .includes(query.toLowerCase().replace(/\s+/g, ''))
        );
  }, [query, options]);

  const inputRef = useRef<HTMLInputElement>(null);

  const item = options.find((i) => i.value === value) ?? null;

  const placeholderStyles = clsx({
    'block truncate': true,
    'text-grayLight-70': !value,
  });

  return (
    <div className={styles}>
      <Combobox
        value={item}
        onChange={(newItem) => {
          if (newItem) {
            onSelect(newItem.value);
          } else {
            onSelect(null);
          }
        }}
      >
        {({ open }) => (
          <div className="relative w-full text-md">
            <Combobox.Input<'input', OptionType<T> | null>
              className={
                (open ? 'dark:border-brand-500 ' : '') +
                'relative flex w-full cursor-pointer items-center justify-between rounded-lg border border-grayLight-40 px-2 py-3 pl-3 text-left outline-none dark:border-grayDark-40 dark:bg-grayDark-40'
              }
              displayValue={(item) => item?.label ?? ''}
              onChange={(event) => setQuery(event.target.value)}
              value={query}
              ref={inputRef}
              placeholder={placeholder}
            />
            <Combobox.Button
              className="absolute top-0 left-0 flex h-full w-full items-center justify-end pr-2"
              onClick={() => {
                inputRef.current?.select();
              }}
            >
              <UpDownArrow />
            </Combobox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterLeave={() => setQuery('')}
            >
              <Combobox.Options
                className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md
              border border-grayLight-40 bg-white py-1
              text-black shadow-lg
              ring-1 ring-black
              ring-opacity-5 focus:outline-none dark:border-grayDark-40 dark:bg-grayDark-10 dark:text-white"
              >
                {filteredOptions.length === 0 && query !== '' ? (
                  <div className="relative cursor-default select-none py-3 px-3 text-grayLight-80">
                    Nothing found.
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <Combobox.Option
                      key={option.value}
                      className={({ active }) =>
                        `${
                          active && 'bg-grayLight-30 dark:bg-grayDark-30'
                        } relative cursor-pointer select-none py-3 px-3`
                      }
                      value={option}
                    >
                      {(props) =>
                        renderOption ? (
                          <>{renderOption(option.value, props)}</>
                        ) : (
                          <span
                            className={`${
                              props.selected ? 'font-medium' : 'font-normal'
                            } block truncate`}
                          >
                            {option.label}
                          </span>
                        )
                      }
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        )}
      </Combobox>
    </div>
  );
}
