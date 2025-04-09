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

interface DatePickerProps {
  label?: string;
  placeholder?: string;
  singleDate?: boolean; // If true, only one date picker is shown
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
}

export function DatePicker({
  label = 'Select Dates',
  placeholder = 'Select dates',
  singleDate = false,
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
}: DatePickerProps) {
  const [open, setOpen] = React.useState(initiallyOpen);
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
    
    if (singleDate || !endDate) {
      return format(startDate, dateFormat);
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
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onStartDateChange(undefined);
      return;
    }
    
    if (singleDate) {
      onStartDateChange(date);
      setDateRange({ from: date, to: undefined });
    } else {
      // If no start date is set, set it
      if (!startDate) {
        onStartDateChange(date);
        setDateRange({ from: date, to: undefined });
      }
      // If start date is set but no end date, set end date
      else if (!endDate) {
        // Handle selecting a date before the start date
        if (date < startDate) {
          onEndDateChange(startDate);
          onStartDateChange(date);
          setDateRange({ from: date, to: startDate });
        } else {
          onEndDateChange(date);
          setDateRange({ from: startDate, to: date });
        }
      }
      // If both dates are set, reset and set new start date
      else {
        onEndDateChange(undefined);
        onStartDateChange(date);
        setDateRange({ from: date, to: undefined });
      }
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
              className="w-full h-full py-2 px-4 focus:outline-none text-gray-800 cursor-pointer bg-transparent"
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
          {singleDate ? (
            // Single date mode - show just one calendar
            <div className="p-1">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleDateSelect}
                initialFocus
                disabled={(date) => {
                  if (date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
                showOutsideDays={false}
                classNames={{
                  day_selected: "bg-indigo-600 text-white hover:bg-indigo-700",
                  month: "space-y-2",
                  caption: "flex justify-center relative items-center mb-0",
                  caption_label: "text-sm font-medium",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell: "text-xs w-7 font-normal text-gray-500 text-center",
                  row: "flex w-full justify-between",
                  cell: "text-center text-xs p-0 relative focus-within:relative focus-within:z-20 w-7",
                  day: "h-7 w-7 p-0 mx-auto font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 p-0 flex items-center justify-center",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1"
                }}
              />
            </div>
          ) : (
            // Range mode
            <div className="p-1">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={(range) => {
                  if (range?.from) {
                    onStartDateChange(range.from);
                    onEndDateChange(range.to);
                    setDateRange(range);
                  } else {
                    onStartDateChange(undefined);
                    onEndDateChange(undefined);
                    setDateRange(undefined);
                  }
                }}
                initialFocus
                disabled={(date) => {
                  if (date < minDate) return true;
                  if (maxDate && date > maxDate) return true;
                  return false;
                }}
                numberOfMonths={2}
                showOutsideDays={false}
                classNames={{
                  day_range_middle: "bg-indigo-100 text-indigo-900",
                  day_selected: "bg-indigo-600 text-white hover:bg-indigo-700",
                  day_range_end: "bg-indigo-600 text-white hover:bg-indigo-700",
                  day_range_start: "bg-indigo-600 text-white hover:bg-indigo-700",
                  month: "space-y-2",
                  caption: "flex justify-center relative items-center mb-0",
                  caption_label: "text-sm font-medium",
                  table: "w-full border-collapse",
                  head_row: "flex justify-between",
                  head_cell: "text-xs w-7 font-normal text-gray-500 text-center",
                  row: "flex w-full justify-between",
                  cell: "text-center text-xs p-0 relative focus-within:relative focus-within:z-20 w-7",
                  day: "h-7 w-7 p-0 mx-auto font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded-md",
                  nav: "space-x-1 flex items-center",
                  nav_button: "h-7 w-7 p-0 flex items-center justify-center",
                  nav_button_previous: "absolute left-1",
                  nav_button_next: "absolute right-1"
                }}
              />
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}