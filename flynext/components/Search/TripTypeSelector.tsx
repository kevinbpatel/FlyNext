'use client';

import { useState } from 'react';
import { RefreshCw, ArrowRight, ChevronDown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

type TripTypeProps = {
  tripType: 'round-trip' | 'one-way';
  onTripTypeChange: (type: 'round-trip' | 'one-way') => void;
  className?: string;
};

export const TripTypeSelector = ({ tripType, onTripTypeChange, className = '' }: TripTypeProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  
  return (
    <div className={className}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className={`inline-block rounded-lg ${isOpen ? 'ring-2 ring-primary' : 'hover:border-input'} transition-all duration-200 shadow-sm`}
          >
            <button
              type="button"
              className="h-10 bg-card border border-border rounded-lg text-sm px-4 py-2 flex items-center space-x-1 focus:outline-none text-foreground"
            >
              {tripType === 'round-trip' ? (
                <span className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-1.5 text-primary" />
                  Round trip
                </span>
              ) : (
                <span className="flex items-center">
                  <ArrowRight className="w-4 h-4 mr-1.5 text-primary" />
                  One way
                </span>
              )}
              <ChevronDown className="h-3.5 w-3.5 ml-1 text-muted-foreground" />
            </button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0">
          <div className="py-1">
            <button
              type="button"
              className={`w-full text-left px-4 py-2 ${tripType === 'round-trip' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
              onClick={() => {
                onTripTypeChange('round-trip');
                setIsOpen(false);
              }}
            >
              <span className="flex items-center">
                <RefreshCw className="w-4 h-4 mr-2" />
                Round trip
              </span>
            </button>
            <button
              type="button"
              className={`w-full text-left px-4 py-2 ${tripType === 'one-way' ? 'bg-primary/10 text-primary' : 'hover:bg-muted'}`}
              onClick={() => {
                onTripTypeChange('one-way');
                setIsOpen(false);
              }}
            >
              <span className="flex items-center">
                <ArrowRight className="w-4 h-4 mr-2" />
                One way
              </span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};