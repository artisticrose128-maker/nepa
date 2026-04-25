import React from 'react';

type GridCols = 1 | 2 | 3 | 4 | 5 | 6 | 12;
type GridGap  = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12;
type ColSpan  = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 'full';

interface GridProps {
  children: React.ReactNode;
  /** Columns at each breakpoint */
  cols?: GridCols;
  colsSm?: GridCols;
  colsMd?: GridCols;
  colsLg?: GridCols;
  colsXl?: GridCols;
  gap?: GridGap;
  gapX?: GridGap;
  gapY?: GridGap;
  as?: React.ElementType;
  className?: string;
}

interface GridItemProps {
  children: React.ReactNode;
  /** Column span at each breakpoint */
  span?: ColSpan;
  spanSm?: ColSpan;
  spanMd?: ColSpan;
  spanLg?: ColSpan;
  spanXl?: ColSpan;
  as?: React.ElementType;
  className?: string;
}

const colsClass: Record<GridCols, string> = {
  1:  'grid-cols-1',
  2:  'grid-cols-2',
  3:  'grid-cols-3',
  4:  'grid-cols-4',
  5:  'grid-cols-5',
  6:  'grid-cols-6',
  12: 'grid-cols-12',
};

const smColsClass: Record<GridCols, string> = {
  1:  'sm:grid-cols-1',
  2:  'sm:grid-cols-2',
  3:  'sm:grid-cols-3',
  4:  'sm:grid-cols-4',
  5:  'sm:grid-cols-5',
  6:  'sm:grid-cols-6',
  12: 'sm:grid-cols-12',
};

const mdColsClass: Record<GridCols, string> = {
  1:  'md:grid-cols-1',
  2:  'md:grid-cols-2',
  3:  'md:grid-cols-3',
  4:  'md:grid-cols-4',
  5:  'md:grid-cols-5',
  6:  'md:grid-cols-6',
  12: 'md:grid-cols-12',
};

const lgColsClass: Record<GridCols, string> = {
  1:  'lg:grid-cols-1',
  2:  'lg:grid-cols-2',
  3:  'lg:grid-cols-3',
  4:  'lg:grid-cols-4',
  5:  'lg:grid-cols-5',
  6:  'lg:grid-cols-6',
  12: 'lg:grid-cols-12',
};

const xlColsClass: Record<GridCols, string> = {
  1:  'xl:grid-cols-1',
  2:  'xl:grid-cols-2',
  3:  'xl:grid-cols-3',
  4:  'xl:grid-cols-4',
  5:  'xl:grid-cols-5',
  6:  'xl:grid-cols-6',
  12: 'xl:grid-cols-12',
};

const gapClass: Record<GridGap, string> = {
  0: 'gap-0', 1: 'gap-1', 2: 'gap-2', 3: 'gap-3',
  4: 'gap-4', 5: 'gap-5', 6: 'gap-6', 8: 'gap-8',
  10: 'gap-10', 12: 'gap-12',
};

const gapXClass: Record<GridGap, string> = {
  0: 'gap-x-0', 1: 'gap-x-1', 2: 'gap-x-2', 3: 'gap-x-3',
  4: 'gap-x-4', 5: 'gap-x-5', 6: 'gap-x-6', 8: 'gap-x-8',
  10: 'gap-x-10', 12: 'gap-x-12',
};

const gapYClass: Record<GridGap, string> = {
  0: 'gap-y-0', 1: 'gap-y-1', 2: 'gap-y-2', 3: 'gap-y-3',
  4: 'gap-y-4', 5: 'gap-y-5', 6: 'gap-y-6', 8: 'gap-y-8',
  10: 'gap-y-10', 12: 'gap-y-12',
};

const spanClass: Record<ColSpan, string> = {
  1: 'col-span-1', 2: 'col-span-2', 3: 'col-span-3', 4: 'col-span-4',
  5: 'col-span-5', 6: 'col-span-6', 7: 'col-span-7', 8: 'col-span-8',
  9: 'col-span-9', 10: 'col-span-10', 11: 'col-span-11', 12: 'col-span-12',
  full: 'col-span-full',
};

const smSpanClass: Record<ColSpan, string> = {
  1: 'sm:col-span-1', 2: 'sm:col-span-2', 3: 'sm:col-span-3', 4: 'sm:col-span-4',
  5: 'sm:col-span-5', 6: 'sm:col-span-6', 7: 'sm:col-span-7', 8: 'sm:col-span-8',
  9: 'sm:col-span-9', 10: 'sm:col-span-10', 11: 'sm:col-span-11', 12: 'sm:col-span-12',
  full: 'sm:col-span-full',
};

const mdSpanClass: Record<ColSpan, string> = {
  1: 'md:col-span-1', 2: 'md:col-span-2', 3: 'md:col-span-3', 4: 'md:col-span-4',
  5: 'md:col-span-5', 6: 'md:col-span-6', 7: 'md:col-span-7', 8: 'md:col-span-8',
  9: 'md:col-span-9', 10: 'md:col-span-10', 11: 'md:col-span-11', 12: 'md:col-span-12',
  full: 'md:col-span-full',
};

const lgSpanClass: Record<ColSpan, string> = {
  1: 'lg:col-span-1', 2: 'lg:col-span-2', 3: 'lg:col-span-3', 4: 'lg:col-span-4',
  5: 'lg:col-span-5', 6: 'lg:col-span-6', 7: 'lg:col-span-7', 8: 'lg:col-span-8',
  9: 'lg:col-span-9', 10: 'lg:col-span-10', 11: 'lg:col-span-11', 12: 'lg:col-span-12',
  full: 'lg:col-span-full',
};

const xlSpanClass: Record<ColSpan, string> = {
  1: 'xl:col-span-1', 2: 'xl:col-span-2', 3: 'xl:col-span-3', 4: 'xl:col-span-4',
  5: 'xl:col-span-5', 6: 'xl:col-span-6', 7: 'xl:col-span-7', 8: 'xl:col-span-8',
  9: 'xl:col-span-9', 10: 'xl:col-span-10', 11: 'xl:col-span-11', 12: 'xl:col-span-12',
  full: 'xl:col-span-full',
};

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  colsSm,
  colsMd,
  colsLg,
  colsXl,
  gap,
  gapX,
  gapY,
  as: Tag = 'div',
  className = '',
}) => {
  const classes = [
    'grid',
    colsClass[cols],
    colsSm  ? smColsClass[colsSm]  : '',
    colsMd  ? mdColsClass[colsMd]  : '',
    colsLg  ? lgColsClass[colsLg]  : '',
    colsXl  ? xlColsClass[colsXl]  : '',
    gap  !== undefined ? gapClass[gap]   : '',
    gapX !== undefined ? gapXClass[gapX] : '',
    gapY !== undefined ? gapYClass[gapY] : '',
    className,
  ].filter(Boolean).join(' ');

  return <Tag className={classes}>{children}</Tag>;
};

export const GridItem: React.FC<GridItemProps> = ({
  children,
  span,
  spanSm,
  spanMd,
  spanLg,
  spanXl,
  as: Tag = 'div',
  className = '',
}) => {
  const classes = [
    span   ? spanClass[span]     : '',
    spanSm ? smSpanClass[spanSm] : '',
    spanMd ? mdSpanClass[spanMd] : '',
    spanLg ? lgSpanClass[spanLg] : '',
    spanXl ? xlSpanClass[spanXl] : '',
    className,
  ].filter(Boolean).join(' ');

  return <Tag className={classes}>{children}</Tag>;
};
