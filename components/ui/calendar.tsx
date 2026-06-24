'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { cn } from '@/lib/utils';

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3 text-ink', className)}
      classNames={{
        months: 'flex flex-col sm:flex-row gap-6',
        month: 'space-y-3',
        caption: 'flex items-center justify-between px-1 pt-1',
        caption_label: 'text-title-sm capitalize',
        nav: 'flex items-center gap-1',
        nav_button: cn(
          'inline-flex h-8 w-8 items-center justify-center rounded-full border border-hairline bg-white text-ink',
          'transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2',
          'disabled:opacity-40',
        ),
        nav_button_previous: '',
        nav_button_next: '',
        table: 'w-full border-collapse',
        head_row: 'flex',
        head_cell:
          'w-9 text-caption-sm text-muted font-medium uppercase tracking-wide text-center',
        row: 'flex w-full mt-1',
        cell: cn(
          'relative h-9 w-9 text-center text-body-sm focus-within:relative focus-within:z-20',
          // Range middle: pale green band that fills the cell edge-to-edge
          '[&:has([aria-selected].day-range-middle)]:bg-primary-soft',
          // Range endpoints: keep the band on the inside half so the rounded
          // pill of the endpoint visually connects to the band
          '[&:has([aria-selected].day-range-start)]:rounded-l-full',
          '[&:has([aria-selected].day-range-end)]:rounded-r-full',
        ),
        day: cn(
          'inline-flex h-9 w-9 items-center justify-center rounded-full font-normal',
          'transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1',
          'aria-selected:opacity-100',
        ),
        day_range_start:
          'day-range-start bg-primary text-white hover:bg-primary-active focus:bg-primary',
        day_range_end:
          'day-range-end bg-primary text-white hover:bg-primary-active focus:bg-primary',
        day_selected:
          'bg-primary text-white hover:bg-primary-active focus:bg-primary',
        day_today: 'border border-ink',
        day_outside: 'text-muted-soft opacity-60',
        day_disabled: 'text-muted-soft opacity-40 pointer-events-none',
        day_range_middle:
          'day-range-middle !bg-transparent text-ink hover:!bg-primary-soft',
        day_hidden: 'invisible',
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
      }}
      {...props}
    />
  );
}
