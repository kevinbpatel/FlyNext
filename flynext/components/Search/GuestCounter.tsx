'use client';

import { useState, useEffect, useRef } from 'react';
import { Minus, Plus, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// Props for individual counter items
interface CounterItemProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  minValue?: number;
  maxValue?: number;
}

// Counter item component for each traveler/guest type
export function CounterItem({
  label,
  description,
  value,
  onChange,
  minValue = 0,
  maxValue = 99
}: CounterItemProps) {
  const increment = () => {
    if (value < maxValue) {
      onChange(value + 1);
    }
  };

  const decrement = () => {
    if (value > minValue) {
      onChange(value - 1);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={decrement}
          disabled={value <= minValue}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-6 text-center">{value}</span>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8"
          onClick={increment}
          disabled={value >= maxValue}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Configuration for different traveler/guest types
export interface GuestType {
  id: string;
  label: string;
  description: string;
  minValue?: number;
  maxValue?: number;
  defaultValue?: number;
}

// Main component props
export interface GuestCounterProps {
  label?: string;
  className?: string;
  guestTypes: GuestType[];
  onChange?: (counts: Record<string, number>) => void;
  onSummaryChange?: (summary: string) => void;
  formatSummary?: (counts: Record<string, number>) => string;
  triggerClassName?: string;
  initialOpen?: boolean;
  summaryFormat?: 'detailed' | 'simple' | 'traveler';
  hideChevron?: boolean;
}

// Helper function to generate summary text - moved outside the component to avoid recreation
function generateSummary(
  counts: Record<string, number>,
  formatSummary?: (counts: Record<string, number>) => string,
  summaryFormat: 'detailed' | 'simple' | 'traveler' = 'detailed'
): string {
  if (formatSummary) {
    // Use custom formatter if provided
    return formatSummary(counts);
  }
  
  // Default formatting based on summaryFormat prop
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  
  // Handle specific known types
  const adults = counts['adults'] || 0;
  const children = counts['children'] || 0;
  const infants = counts['infants'] || 0;
  
  if (summaryFormat === 'traveler') {
    // Format specifically for the flight search bar
    return `${total} ${total === 1 ? 'Traveler' : 'Travelers'}`;
  } else if (summaryFormat === 'simple') {
    // Simple total count
    if (total > 0) {
      return `${total} ${total === 1 ? 'Guest' : 'Guests'}`;
    } else {
      return "Select guests";
    }
  } else {
    // Detailed breakdown (default)
    if (adults > 0 && children === 0 && infants === 0) {
      return `${adults} ${adults === 1 ? 'Adult' : 'Adults'}`;
    } else if (total > 0) {
      const parts = [];
      if (adults > 0) parts.push(`${adults} ${adults === 1 ? 'Adult' : 'Adults'}`);
      if (children > 0) parts.push(`${children} ${children === 1 ? 'Child' : 'Children'}`);
      if (infants > 0) parts.push(`${infants} ${infants === 1 ? 'Infant' : 'Infants'}`);
      return parts.join(', ');
    } else {
      return "Select guests";
    }
  }
}

// Get initial counts without triggering updates
function getInitialCounts(guestTypes: GuestType[]): Record<string, number> {
  const initialCounts: Record<string, number> = {};
  guestTypes.forEach(type => {
    initialCounts[type.id] = type.defaultValue || 0;
  });
  
  // Ensure at least one adult (or first item) if no defaults provided
  if (guestTypes.length > 0 && Object.values(initialCounts).every(v => v === 0)) {
    initialCounts[guestTypes[0].id] = 1;
  }
  
  return initialCounts;
}

// Main guest counter component
export function GuestCounter({
  label = "Guests",
  className = "",
  guestTypes,
  onChange,
  onSummaryChange,
  formatSummary,
  triggerClassName = "",
  initialOpen = false,
  summaryFormat = 'detailed',
  hideChevron = false
}: GuestCounterProps) {
  // Initialize counts state with default values
  const [counts, setCounts] = useState<Record<string, number>>(() => 
    getInitialCounts(guestTypes)
  );
  
  // Initialize summary separately with a derived value
  const [summary, setSummary] = useState<string>(() => 
    generateSummary(getInitialCounts(guestTypes), formatSummary, summaryFormat)
  );
  
  const [isOpen, setIsOpen] = useState(initialOpen);
  const [popoverSide, setPopoverSide] = useState<'top' | 'bottom'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Refs to prevent calling callbacks during render
  const initialRenderRef = useRef(true);
  
  // Handle responsive positioning
  useEffect(() => {
    const handleResize = () => {
      setPopoverSide(window.innerWidth < 768 ? 'top' : 'bottom');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Generate and update summary text when counts change
  useEffect(() => {
    const newSummary = generateSummary(counts, formatSummary, summaryFormat);
    setSummary(newSummary);
    
    // Only call onSummaryChange after initial render to prevent render-phase updates
    if (!initialRenderRef.current && onSummaryChange) {
      onSummaryChange(newSummary);
    }
  }, [counts, formatSummary, summaryFormat]);
  
  // Handle initial callbacks - separate from the main effect to avoid render-phase updates
  useEffect(() => {
    // Call onChange with initial counts
    if (initialRenderRef.current) {
      initialRenderRef.current = false;
      
      // Only call these if they exist
      if (onChange) {
        onChange(counts);
      }
      if (onSummaryChange) {
        onSummaryChange(summary);
      }
    }
  }, []);

  // Handle count changes for a specific guest type
  const handleCountChange = (id: string, value: number) => {
    const newCounts = { ...counts, [id]: value };
    setCounts(newCounts);
    
    // Call onChange callback with updated counts - safe to do here since it's an event handler
    if (onChange) {
      onChange(newCounts);
    }
  };

  // Handle open state change with callback
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    
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
    if (containerRef.current && !isOpen && !containerRef.current.contains(e.relatedTarget as Node)) {
      const parentContainer = containerRef.current.closest('div[class*="border-"]');
      if (parentContainer) {
        parentContainer.classList.remove('!border-indigo-500');
      }
    }
  };

  return (
    <div className={className}>
      <div className="flex flex-col h-full" ref={containerRef}>
        {label && <div className="text-xs text-muted-foreground pl-4 pt-2">{label}</div>}
        <Popover open={isOpen} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className={`w-full h-full flex items-center justify-between text-sm overflow-hidden flex-1 focus:outline-none ${triggerClassName}`}
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
                value={summary}
                placeholder="Select guests"
                className="w-full h-full py-2 px-4 focus:outline-none text-foreground cursor-pointer bg-transparent"
                onMouseDown={(e) => e.preventDefault()}
              />
              {!hideChevron && (
                <div className="pr-3">
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-4" 
            align="center" 
            side={popoverSide} 
            sideOffset={8}
          >
            <div className="space-y-4">
              {guestTypes.map((type) => (
                <CounterItem
                  key={type.id}
                  label={type.label}
                  description={type.description}
                  value={counts[type.id] || 0}
                  onChange={(value) => handleCountChange(type.id, value)}
                  minValue={type.minValue}
                  maxValue={type.maxValue}
                />
              ))}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}