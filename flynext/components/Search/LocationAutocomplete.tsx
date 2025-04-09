'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { Plane, Building, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Types for location suggestions
type LocationType = 'city' | 'airport';

interface LocationOption {
  type: LocationType;
  name: string;
  code?: string;
  country?: string;
  cityName?: string;
  value: string;
  display: string;
}

// Props for the LocationCombobox component
interface LocationComboboxProps {
  id?: string; // Unique identifier to prevent state collisions
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSelect: (value: string) => void;
  hideChevron?: boolean; // New prop to control chevron visibility
}

export function LocationCombobox({
  id = 'location', // Default unique ID
  label,
  placeholder,
  value,
  onChange,
  onSelect,
  hideChevron = false,
}: LocationComboboxProps) {
  const [showOptions, setShowOptions] = React.useState(false);
  const [inputValue, setInputValue] = React.useState('');
  const [options, setOptions] = React.useState<LocationOption[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const optionsRef = React.useRef<HTMLDivElement[]>([]);

  // Mount state for client-side rendering
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-select first option when options change
  React.useEffect(() => {
    // Reset the refs array
    optionsRef.current = [];

    // Select the first option if there are any options available
    if (options.length > 0) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [options]);

  // Update dropdown position when input position changes or when dropdown opens
  React.useEffect(() => {
    if (showOptions && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width
      });
    }
  }, [showOptions]);

  // Update position on scroll or resize
  React.useEffect(() => {
    if (!showOptions) return;

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      }
    };

    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showOptions]);

  // Handle outside clicks
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node) &&
        document.getElementById(`dropdown-${id}`) &&
        !document.getElementById(`dropdown-${id}`)?.contains(e.target as Node)
      ) {
        setShowOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id]);

  // Fetch location suggestions
  React.useEffect(() => {
    if (inputValue.length < 1) {
      setOptions([]);
      return;
    }

    const fetchOptions = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/flights/autocomplete?q=${encodeURIComponent(inputValue)}`);
        if (!response.ok) throw new Error(`API error: ${response.status}`);

        const data = await response.json();

        const formattedOptions: LocationOption[] = [
          ...(data.suggestions.cities || []).map((city: any, index: number) => ({
            type: 'city',
            name: city.name,
            country: city.country,
            value: `city-${city.name}-${index}`,
            display: city.country ? `${city.name}, ${city.country}` : city.name
          })),
          ...(data.suggestions.airports || []).map((airport: any, index: number) => ({
            type: 'airport',
            name: airport.name,
            code: airport.code,
            cityName: airport.cityName,
            value: `airport-${airport.code || ''}-${index}`,
            display: airport.code
              ? `${airport.name} (${airport.code})${airport.cityName ? ` - ${airport.cityName}` : ''}`
              : airport.name
          })),
        ];

        setOptions(formattedOptions);
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
        setOptions([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce API calls
    const timer = setTimeout(fetchOptions, 150);
    return () => clearTimeout(timer);
  }, [inputValue]);

  // Scroll highlighted option into view
  React.useEffect(() => {
    if (highlightedIndex >= 0 && optionsRef.current[highlightedIndex]) {
      optionsRef.current[highlightedIndex]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [highlightedIndex]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowOptions(true);
  };

  // Clear input
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setInputValue('');
    onChange('');
    inputRef.current?.focus();
  };

  // Handle option selection
  const handleOptionSelect = (option: LocationOption) => {
    setInputValue('');
    onChange(option.display);
    onSelect(option.display);
    setShowOptions(false);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // If dropdown is not shown, open it on arrow down
    if (!showOptions && e.key === 'ArrowDown') {
      setShowOptions(true);
      e.preventDefault();
      return;
    }

    if (!showOptions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < options.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev > 0 ? prev - 1 : options.length - 1
        );
        break;

      case 'Enter':
        e.preventDefault(); // Prevent form submission or other default behavior
        if (options.length > 0 && highlightedIndex >= 0) {
          handleOptionSelect(options[highlightedIndex]);
        }
        break;

      case 'Escape':
        e.preventDefault();
        setShowOptions(false);
        break;

      case 'Tab':
        setShowOptions(false);
        break;
    }
  };

  // Correctly handle ref creation for list items
  const setOptionRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      optionsRef.current[index] = el;
    }
  };

  // Handle container click
  const handleContainerClick = () => {
    if (!value) {
      inputRef.current?.focus();
      setShowOptions(true);
    }
  };

  // Render dropdown portal
  const renderDropdown = () => {
    if (!showOptions || !mounted) return null;

    return createPortal(
      <div
        id={`dropdown-${id}`}
        className="fixed bg-card border border-border rounded-md shadow-xl overflow-hidden"
        style={{
          top: `${dropdownPosition.top + 8}px`, // Match the gap size of datepicker
          left: `${dropdownPosition.left}px`,
          width: `${dropdownPosition.width}px`,
          zIndex: 99999,
        }}
      >
        <div className="max-h-60 overflow-y-auto">
          {loading && (
            <div className="py-2 px-3 text-sm text-muted-foreground">Loading...</div>
          )}
          {!loading && inputValue.length < 1 && (
            <div className="py-2 px-3 text-sm text-muted-foreground">Start typing to search</div>
          )}
          {!loading && inputValue.length >= 1 && options.length === 0 && (
            <div className="py-2 px-3 text-sm text-muted-foreground">No locations found</div>
          )}
          {options.length > 0 && (
            <div className="py-1">
              {options.map((option, index) => (
                <div
                  key={option.value}
                  ref={(el) => setOptionRef(el, index)}
                  className={`flex items-center px-3 py-2 text-sm cursor-pointer ${
                    highlightedIndex === index 
                      ? 'bg-primary/10 text-primary' 
                      : 'hover:bg-muted text-foreground'
                  }`}
                  onClick={() => handleOptionSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {option.type === 'city' ? (
                    <Building className={`mr-2 h-4 w-4 flex-shrink-0 ${
                      highlightedIndex === index ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  ) : (
                    <Plane className={`mr-2 h-4 w-4 flex-shrink-0 ${
                      highlightedIndex === index ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  )}
                  <div>
                    <div className="text-sm">
                      {option.name}
                      {option.type === 'airport' && option.code && (
                        <span className={
                          highlightedIndex === index ? 'ml-1 text-primary/70' : 'ml-1 text-muted-foreground'
                        }>
                          ({option.code})
                        </span>
                      )}
                    </div>
                    <div className={
                      highlightedIndex === index ? 'text-xs text-primary/70' : 'text-xs text-muted-foreground'
                    }>
                      {option.type === 'city' && option.country && (
                        <span>{option.country}</span>
                      )}
                      {option.type === 'airport' && option.cityName && (
                        <span>{option.cityName}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>,
      document.body
    );
  };

  return (
    <div className="flex flex-col h-full">
      {label && <div className="text-xs text-muted-foreground pl-4 pt-2">{label}</div>}
      <div
        ref={containerRef}
        className="relative flex-1 flex flex-col justify-center w-full"
        onClick={handleContainerClick}
      >
        {/* Input container - fixed width */}
        <div className="relative flex-1 flex items-center h-full w-full overflow-hidden">
          {value ? (
            // Show location chip when a value is selected
            <div className="flex items-center px-4 w-full h-full">
              <div className="inline-flex items-center bg-muted hover:bg-muted/80 rounded-md overflow-hidden transition-colors h-8 max-w-full">
                <div className="pl-3 pr-1 py-1 text-sm truncate max-w-[calc(100%-32px)] text-foreground">
                  {value}
                </div>
                <button
                  type="button"
                  onClick={handleClear}
                  aria-label="Clear selection"
                  className="flex-shrink-0 flex items-center justify-center h-8 w-8 -pl-100"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ) : (
            // Show input field when no value is selected
            <input
              ref={inputRef}
              id={`location-input-${id}`}
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setShowOptions(true);
              }}
              className="w-full h-full px-4 py-2 focus:outline-none text-sm text-foreground bg-transparent"
              placeholder={placeholder}
              autoComplete="off"
              tabIndex={0}
            />
          )}
        </div>

        {/* Render dropdown via portal */}
        {renderDropdown()}
      </div>
    </div>
  );
}