import React, { ReactNode, useState } from 'react';

import {
  faArrowLeft,
  faArrowRight,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import clsx from 'clsx';

import { useDarkOrLightMode } from '../../lib/dark-mode';
import { Text } from '../base';
import { LoaderSingleLine } from '../loaders';

import { TableBody } from './TableBody';
import { TableCell } from './TableCell';
import { TableHeader } from './TableHeader';
import { TableHeaderCell } from './TableHeaderCell';
import { TableRow } from './TableRow';

export type ColumnDef<T> = {
  label: string | ReactNode;
  align?: 'left' | 'right';
  renderLoading?: () => ReactNode;

  /**
   * [undefined]: always show
   * ['sm']: show when screen width is >= sm
   * ['md']: show when screen width is >= md
   */
  show?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';

  /**
   * Tailwind className to set column width.
   */
  widthClassName?: string;
} & (
    | {
      type: 'string';
      getCellValue: (row: T) => string;
    }
    | {
      type: 'custom';
      renderCell: (row: T) => ReactNode;
    }
  );

function getColumnStyles(column: ColumnDef<any>) {
  return clsx({
    'text-right': column.align === 'right',
    'text-left': column.align === 'left',
    'hidden sm:table-cell': column.show === 'sm',
    'hidden md:table-cell': column.show === 'md',
    'hidden lg:table-cell': column.show === 'lg',
    'hidden xl:table-cell': column.show === 'xl',
    'hidden 2xl:table-cell': column.show === '2xl',
    'h-full shrink-0': true,
    [`${column.widthClassName}`]: true,
  });
}
interface TableProps<T> extends React.HTMLAttributes<HTMLTableElement> {
  columns: ColumnDef<T>[];
  tableClassName?: string;
  data: T[];
  onRowClick?: (row: T) => void;
  allowRowClick?: (row: T) => boolean;

  loading?: boolean;
  renderEmpty?: () => ReactNode;

  pageSize?: number;
  paginated?: boolean;

  loadingRows?: number;
  rowHeightClassName?: string;

  noHeader?: boolean;
}
export function Table<T>(props: TableProps<T>) {
  const {
    className,
    children,
    columns,
    tableClassName,
    rowHeightClassName,
    data = [],
    loading = false,
    renderEmpty = () => <Text>No data</Text>,
    onRowClick,
    paginated = false,
    pageSize = data.length,
    noHeader = false,
    loadingRows = pageSize,
    ...rest
  } = props;

  const mode = useDarkOrLightMode();

  const [page, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const increasePage = () => {
    setPage((page) => Math.min(page + 1, totalPages - 1));
  };

  const decreasePage = () => {
    setPage((page) => Math.max(page - 1, 0));
  };

  const renderedData = data.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <div className={clsx('relative overflow-x-visible', className)}>
      <table
        className={clsx(
          'w-full text-left text-grayLight-60 dark:text-grayDark-110',
          tableClassName
        )}
        {...rest}
      >
        <TableHeader>
          <tr className="relative h-11">
            {!noHeader && (
              <TableHeaderCell className="h-11 w-3 rounded-tl-2xl bg-grayLight-10 dark:bg-grayDark-20"></TableHeaderCell>
            )}

            {columns.map((column, idx) => {
              if (noHeader) return undefined;
              const style = getColumnStyles(column);
              if (typeof column.label === 'string') {
                return (
                  <TableHeaderCell scope="col" className={style} key={idx}>
                    <Text
                      size="sm"
                      weight="light"
                      color={mode === 'light' ? 'normal' : 'secondary'}
                    >
                      {column.label}
                    </Text>
                  </TableHeaderCell>
                );
              } else {
                return (
                  <TableHeaderCell className={style} key={idx}>
                    {column.label}
                  </TableHeaderCell>
                );
              }
            })}
            {!noHeader && (
              <TableHeaderCell className="h-11 w-3 rounded-tr-2xl bg-grayLight-10 dark:bg-grayDark-20"></TableHeaderCell>
            )}
          </tr>
        </TableHeader>

        <tbody className="h-2"></tbody>
        {loading && (
          <TableBody>
            {Array(loadingRows)
              .fill(0)
              .map((_, index) => (
                <TableRow
                  key={index}
                  className={clsx({
                    [`${rowHeightClassName}`]: true,
                  })}
                >
                  {!noHeader && <TableCell className="w-3"></TableCell>}

                  {columns.map((column, idx) => {
                    const styles = clsx(getColumnStyles(column), {
                      [`${rowHeightClassName}`]: true,
                    });

                    if (column.renderLoading) {
                      return (
                        <TableCell key={idx} className={clsx(styles, '')}>
                          {column.renderLoading()}
                        </TableCell>
                      );
                    } else {
                      const loaderStyles = clsx({
                        'pl-2': column.align === 'right',
                        'pr-2': column.align === 'left',
                      });
                      return (
                        <TableCell key={idx} className={clsx(styles, '')}>
                          <LoaderSingleLine className={loaderStyles} />
                        </TableCell>
                      );
                    }
                  })}
                  {!noHeader && <TableCell className="w-3"></TableCell>}
                </TableRow>
              ))}
          </TableBody>
        )}
        {!loading && (
          <TableBody className="relative">
            {!loading && data.length === 0 && (
              <div className="absolute top-0 w-full">{renderEmpty()}</div>
            )}
            {renderedData.map((item, idx) => {
              const clickable =
                onRowClick &&
                (!props.allowRowClick || props.allowRowClick(item));

              return (
                <TableRow
                  onClick={clickable ? () => onRowClick?.(item) : undefined}
                  key={idx}
                  className={clsx({
                    [`${rowHeightClassName}`]: true,
                    'transition hover:bg-grayLight-10 dark:hover:bg-grayDark-20':
                      true,
                    'cursor-pointer': clickable,
                  })}
                >
                  {!noHeader && <TableCell className="w-3"></TableCell>}

                  {columns.map((column, idx) => {
                    const styles = clsx(getColumnStyles(column), {
                      [`${rowHeightClassName}`]: true,
                    });

                    switch (column.type) {
                      case 'string': {
                        return (
                          <TableCell key={idx} className={clsx(styles, '')}>
                            <Text size="md">{column.getCellValue(item)}</Text>
                          </TableCell>
                        );
                      }
                      case 'custom': {
                        return (
                          <TableCell key={idx} className={styles}>
                            {column.renderCell(item)}
                          </TableCell>
                        );
                      }
                      default:
                        return null;
                    }
                  })}
                  {!noHeader && <TableCell className="w-3"></TableCell>}
                </TableRow>
              );
            })}
            {renderedData.length < pageSize &&
              new Array(pageSize - renderedData.length)
                .fill(0)
                .map((_, idx) => (
                  <TableRow
                    key={idx}
                    className={clsx({
                      [`${rowHeightClassName}`]: true,
                    })}
                  />
                ))}
          </TableBody>
        )}
        {/* Pagination UI */}
      </table>

      {paginated && (
        <>
          <div className="h-2"></div>
          <div className={`mx-3 flex justify-between`}>
            <div className={`flex items-center `}>
              <Text size="md" color="secondary">
                Showing {page * pageSize + 1} -{' '}
                {Math.min(data.length, (page + 1) * pageSize)} of {data.length}{' '}
                entries
              </Text>
            </div>
            <div className="-mr-2 flex items-center">
              <button
                onClick={decreasePage}
                disabled={page === 0}
                className={clsx({
                  'p-2 text-md': true,
                  'cursor-not-allowed text-grayLight-50 dark:text-grayDark-50':
                    page === 0,
                  'dark:text-grayDark-80 dark:hover:text-white': page !== 0,
                })}
              >
                <FontAwesomeIcon className="h-4 w-4" icon={faArrowLeft} />
              </button>
              <div className="mb-0.5 flex items-center">
                <Text size="md" color="secondary">
                  <Text size="md" color="secondary">
                    Page{' '}
                  </Text>
                  <Text size="md" color="secondary">
                    {page + 1} of {totalPages}
                  </Text>
                </Text>
              </div>
              <button
                onClick={increasePage}
                disabled={page === totalPages - 1}
                className={clsx({
                  'p-2 text-md': true,
                  'cursor-not-allowed text-grayLight-50 dark:text-grayDark-50':
                    page === totalPages - 1,
                  'dark:text-grayDark-80 dark:hover:text-white':
                    page !== totalPages - 1,
                })}
              >
                <FontAwesomeIcon className="h-4 w-4" icon={faArrowRight} />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
