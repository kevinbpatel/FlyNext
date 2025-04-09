'use client';

import * as React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { ChevronDown } from 'lucide-react';

interface DateRangePickerProps {
  label?: string;
  placeholder?: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  minDate?: Date; // Minimum selectable date (defaults to today)
  maxDate?: Date; // Maximum selectable date (optional)
  initiallyOpen?: boolean; // Whether the date picker should be initially open
  onOpenChange?: (open: boolean) => void; // Callback when open state changes
  hideChevron?: boolean; // Option to hide chevron icon
  dateFormat?: string; // Custom date format
  rangeSeparator?: string; // Custom separator for date range
  sameDayText?: string; // Custom text for same-day selection
  selectEndText?: string; // Text to show when start date is selected but end date isn't
  startSelectMode?: string; // The name of the first date being selected (e.g. 'departure' or 'check-in')
  endSelectMode?: string; // The name of the second date being selected (e.g. 'return' or 'check-out')
}

export function DateRangePicker({
  label = 'Departure — Return',
  placeholder = 'Select dates',
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  minDate = new Date(),
  maxDate,
  initiallyOpen = false,
  onOpenChange,
  hideChevron = false,
  dateFormat = 'MMM d, yyyy',
  rangeSeparator = '—',
  sameDayText = '(Same day round trip)',
  selectEndText = 'Select return',
  startSelectMode = 'departure',
  endSelectMode = 'return'
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(initiallyOpen);
  const [calendarMode, setCalendarMode] = React.useState<'departure' | 'return'>(startSelectMode as 'departure' | 'return');
  const [popoverSide, setPopoverSide] = React.useState<'top' | 'bottom'>('bottom');
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Handle responsive positioning
  React.useEffect(() => {
    const handleResize = () => {
      // Adjust position based on screen width
      // For mobile or small screens, position it on top
      setPopoverSide(window.innerWidth < 768 ? 'top' : 'bottom');
    };

    // Set initial position
    handleResize();

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Clean up
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initialize date range state for the calendar
  const [dateRange, setDateRange] = React.useState<DateRange | undefined>(
    startDate && endDate ? { from: startDate, to: endDate } :
      startDate ? { from: startDate, to: undefined } : undefined
  );

  // Update the date range when props change
  React.useEffect(() => {
    if (startDate && endDate) {
      setDateRange({ from: startDate, to: endDate });
    } else if (startDate) {
      setDateRange({ from: startDate, to: undefined });
    } else {
      setDateRange(undefined);
    }
  }, [startDate, endDate]);

  // Format the date range for display
  const formatDateRange = (): string => {
    if (!startDate) return placeholder;

    if (!endDate) {
      return `${format(startDate, dateFormat)} ${rangeSeparator} ${selectEndText}`;
    }

    // Special case for same-day round trip
    if (startDate.getTime() === endDate.getTime()) {
      return `${format(startDate, dateFormat)} ${sameDayText}`;
    }

    return `${format(startDate, dateFormat)} ${rangeSeparator} ${format(endDate, dateFormat)}`;
  };

  // Handle open state change with callback
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }

    // Add or remove focus class on the parent container
    if (containerRef.current) {
      const parentContainer = containerRef.current.closest('div[class*="border-"]');
      if (parentContainer) {
        if (newOpen) {
          // Add focus class when opening
          parentContainer.classList.add('!border-indigo-500');
        } else {
          // Remove focus class when closing (only if not actually focused)
          if (!containerRef.current.contains(document.activeElement)) {
            parentContainer.classList.remove('!border-indigo-500');
          }
        }
      }
    }

    // Reset to departure mode when opening the calendar if no dates are selected
    if (newOpen && !startDate) {
      setCalendarMode(startSelectMode as 'departure' | 'return');
    }
  };

  // Handle date selection
  const handleDateSelect = (range: DateRange | undefined) => {
    // Track which date was clicked
    const selectedDate = range?.from && !range.to ? range.from : range?.to;

    // If no selection was made or selection is cleared
    if (!selectedDate) {
      onStartDateChange(undefined);
      onEndDateChange(undefined);
      setDateRange(undefined);
      setCalendarMode(startSelectMode as 'departure' | 'return');
      return;
    }

    // Handle same-day round trip scenario
    if (startDate && !endDate && calendarMode === endSelectMode &&
      selectedDate.getTime() === startDate.getTime()) {
      // Second click on the same date = same-day round trip
      onEndDateChange(selectedDate);
      setDateRange({ from: startDate, to: selectedDate });
      return;
    }

    // Special handling for clicking on already selected dates
    if (startDate && endDate) {
      // Same day round trip - clicking third time should clear both
      if (startDate.getTime() === endDate.getTime() &&
        selectedDate.getTime() === startDate.getTime()) {
        onStartDateChange(undefined);
        onEndDateChange(undefined);
        setDateRange(undefined);
        setCalendarMode(startSelectMode as 'departure' | 'return');
        return;
      }

      // Check if clicked on start date
      if (selectedDate.getTime() === startDate.getTime()) {
        // Deselect the start date, keep only end date
        onStartDateChange(undefined);
        setDateRange(undefined);
        setCalendarMode(startSelectMode as 'departure' | 'return');
        return;
      }

      // Check if clicked on end date
      if (selectedDate.getTime() === endDate.getTime()) {
        // Deselect only the end date
        onEndDateChange(undefined);
        setDateRange({ from: startDate, to: undefined });
        setCalendarMode(endSelectMode as 'departure' | 'return');
        return;
      }
    } else if (startDate && selectedDate.getTime() === startDate.getTime()) {
      // Deselect the only selected date
      onStartDateChange(undefined);
      setDateRange(undefined);
      setCalendarMode(startSelectMode as 'departure' | 'return');
      return;
    }

    // Standard selection flow
    if (range?.from && !range.to) {
      // Selecting first date
      onStartDateChange(range.from);
      onEndDateChange(undefined);
      setDateRange(range);
      setCalendarMode(endSelectMode as 'departure' | 'return');
    } else if (range?.from && range.to) {
      // Selecting both dates
      onStartDateChange(range.from);
      onEndDateChange(range.to);
      setDateRange(range);
    }
  };

  // Handle focus events to maintain highlight state
  const handleFocus = () => {
    if (containerRef.current) {
      const parentContainer = containerRef.current.closest('div[class*="border-"]');
      if (parentContainer) {
        parentContainer.classList.add('!border-indigo-500');
      }
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Only remove focus if we're not focusing another element within our container
    // and the popover is not open
    if (containerRef.current && !open && !containerRef.current.contains(e.relatedTarget as Node)) {
      const parentContainer = containerRef.current.closest('div[class*="border-"]');
      if (parentContainer) {
        parentContainer.classList.remove('!border-indigo-500');
      }
    }
  };

  return (
    <div className="flex flex-col h-full" ref={containerRef}>
      {label && <div className="text-xs text-gray-500 pl-4 pt-2">{label}</div>}
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="w-full h-full flex items-center justify-between text-sm overflow-hidden flex-1 focus:outline-none"
            onFocus={handleFocus}
            onBlur={handleBlur}
            onMouseDown={(e) => {
              // Ensures the button gets focus when clicked
              e.currentTarget.focus();

              // Find and add focus class to parent
              const parentContainer = e.currentTarget.closest('div[class*="border-"]');
              if (parentContainer) {
                parentContainer.classList.add('!border-indigo-500');
              }
            }}
            tabIndex={0}
          >
            <input
              type="text"
              readOnly
              placeholder={placeholder}
              value={formatDateRange()}
              className="w-full h-full py-2 px-4 focus:outline-none text-foreground cursor-pointer bg-transparent"
              // Prevent actual input to ensure it's just a display field
              onMouseDown={(e) => e.preventDefault()}
            />
            {!hideChevron && (
              <div className="pr-3">
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="center"
          side={popoverSide}
          sideOffset={8}
          alignOffset={0}
          onInteractOutside={(e) => {
            // Prevent closing when clicking on date cells
            if ((e.target as HTMLElement).closest('.rdp-day')) {
              e.preventDefault();
            }
          }}
        >
          <div className="p-1">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={handleDateSelect}
              initialFocus
              disabled={(date) => {
                // Always disable dates before minimum date
                if (date < minDate) return true;

                // Check maximum date if provided
                if (maxDate && date > maxDate) return true;

                // In return selection mode, disable dates before the start date
                if (calendarMode === endSelectMode && startDate && date < startDate) return true;

                return false;
              }}
              numberOfMonths={2}
              showOutsideDays={false}
              classNames={{
                day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
                day_range_start: "bg-primary text-primary-foreground rounded-l-md",
                day_range_end: "bg-primary text-primary-foreground rounded-r-md",
                day_range_middle: "bg-primary/50 hover:bg-primary/70 rounded-none",
                month: "space-y-2",
                caption: "flex justify-center relative items-center mb-0",
                caption_label: "text-sm font-medium",
                table: "w-full border-collapse",
                head_row: "flex justify-between",
                head_cell: "text-xs w-7 font-normal text-muted-foreground text-center",
                row: "flex w-full justify-between",
                cell: "text-center text-xs p-0 relative focus-within:relative focus-within:z-20 w-7",
                day: "h-7 w-7 p-0 mx-auto font-normal aria-selected:opacity-100 hover:bg-muted rounded-md",
                nav: "space-x-1 flex items-center",
                nav_button: "h-7 w-7 p-0 flex items-center justify-center hover:bg-muted rounded-md",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1"
              }}
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}