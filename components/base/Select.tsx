import { Fragment } from "react";

import { Listbox, Transition } from "@headlessui/react";
import clsx from "clsx";
import { isEqual } from "date-fns";

import { Text } from "./Text";

const UpDownArrow = (props: { className?: string }) => {
  const { className } = props;

  const styles = clsx({
    "text-grayLight-60": true,
    [`${className}`]: true,
  });

  return (
    <svg
      className={styles}
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

interface SelectProps<T> {
  options: { label: string; value: T }[];
  value: T | null;
  onSelect?: (selectedValue: T | null) => void;
  className?: string;
  placeholder?: string;
  onBlur?: () => void;
  renderOption?: (
    value: T,
    state: { active: boolean; selected: boolean; disabled: boolean }
  ) => React.ReactNode;
  renderSelected?: (value: T) => React.ReactNode;
  renderPlaceholder?: () => React.ReactNode;
  size?: "sm" | "md";
  hideSelectedFromList?: boolean;
}
export const Select = <T extends string | Date | number>({
  options,
  value,
  onSelect = () => {},
  renderSelected,
  renderPlaceholder,
  renderOption,
  onBlur,
  className,
  placeholder,
  size = "md",
  hideSelectedFromList = false,
}: SelectProps<T>) => {
  const valueToLabel = (value: T | null) => {
    if (value === null) {
      return "";
    }

    return options.find((x) =>
      x.value instanceof Date && value instanceof Date
        ? isEqual(x.value, value)
        : x.value === value
    )?.label;
  };

  const styles = clsx({
    "w-auto": !className,
    [`${className}`]: className,
  });

  const placeholderStyles = clsx({
    "block truncate": true,
    "text-grayLight-70": !value,
  });

  const filteredOptions = hideSelectedFromList
    ? options.filter((x) => x.value !== value)
    : options;

  return (
    <div className={styles} onBlur={onBlur}>
      <Listbox
        disabled={options.length === 0}
        value={value}
        onChange={(selectedValue) => {
          if (!selectedValue || selectedValue === value) {
            onSelect(null);
            return;
          }
          onSelect(selectedValue);
        }}
      >
        {({ open }) => (
          <div className="text-md relative">
            <Listbox.Button
              className={clsx({
                "dark:border-brand-500 border-brand-300": open,
                "dark:border-grayDark-40 border-grayLight-40": !open,
                "relative flex w-full cursor-pointer items-center justify-between rounded-md border bg-white":
                  true,
                "py-3 pl-3 pr-1": size === "md",
                "py-1 pl-2 text-sm": size === "sm",
                "text-grayLight-90 text-left ": true,
                "dark:bg-grayDark-40 dark:text-grayDark-100": true,
              })}
            >
              {renderSelected ? (
                value ? (
                  renderSelected(value)
                ) : (
                  renderPlaceholder?.()
                )
              ) : (
                <span className={placeholderStyles}>
                  {value ? valueToLabel(value) : placeholder}
                </span>
              )}

              <UpDownArrow
                className={clsx({
                  "h-5 w-5": size === "md",
                  "ml-px h-4 w-4": size === "sm",
                })}
              />
            </Listbox.Button>
            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              show={open}
            >
              <Listbox.Options
                className="dark:bg-grayDark-10 dark:border-grayDark-40 border-grayLight-20
              absolute z-10 mt-1 max-h-60 w-full
              overflow-auto rounded-md border bg-white
              py-1 text-black shadow-lg
              ring-1 ring-black
              ring-opacity-5 focus:outline-none dark:text-white"
              >
                {filteredOptions.map((option, i) => {
                  return (
                    <Listbox.Option
                      key={i}
                      className={({ active }) =>
                        clsx({
                          "dark:bg-grayDark-30 bg-grayLight-20": active,
                          "relative cursor-pointer select-none": true,
                          "px-3 py-3": size === "md",
                          "px-2 py-1 text-sm": size === "sm",
                        })
                      }
                      value={option.value}
                    >
                      {(props) =>
                        renderOption ? (
                          <>{renderOption(option.value, props)}</>
                        ) : (
                          <span
                            className={`${
                              props.selected ? "font-medium" : "font-normal"
                            } block truncate`}
                          >
                            {option.label}
                          </span>
                        )
                      }
                    </Listbox.Option>
                  );
                })}
                {filteredOptions.length === 0 && (
                  <div className="text-grayLight-70 px-3 py-3 text-sm">
                    <Text color="secondary">No {value && "other "}options</Text>
                  </div>
                )}
              </Listbox.Options>
            </Transition>
          </div>
        )}
      </Listbox>
    </div>
  );
};
