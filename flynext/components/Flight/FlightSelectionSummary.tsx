'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';
import AddToBookingModal from '@/components/Bookings/AddToBookingModal';

interface FlightSummary {
  id: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  currency: string;
  isReturn: boolean;
}

interface FlightSelectionSummaryProps {
  selectedOutboundFlight: FlightSummary | null;
  selectedReturnFlight: FlightSummary | null;
  travelers: number;
  onTravelersChange: (count: number) => void;
  tripType: string;
  currency: string;
}

export const FlightSelectionSummary = ({
  selectedOutboundFlight,
  selectedReturnFlight,
  travelers,
  onTravelersChange,
  tripType,
  currency = 'USD'
}: FlightSelectionSummaryProps) => {
  // Add state for the AddToBookingModal
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getTotalPrice = () => {
    let total = 0;
    if (selectedOutboundFlight) total += selectedOutboundFlight.price * travelers;
    if (selectedReturnFlight) total += selectedReturnFlight.price * travelers;
    return total;
  };

  const canAddToCart = () => {
    if (tripType === 'one-way') {
      return !!selectedOutboundFlight;
    } else {
      return !!selectedOutboundFlight && !!selectedReturnFlight;
    }
  };

  // Handle the "Add to Cart" button click
  const handleAddToCart = () => {
    if (canAddToCart()) {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <div className="sticky bottom-0 z-50 w-full bg-card border-t border-border mt-auto">
        <div className="container mx-auto py-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Flight summary - takes less space */}
            <div className="w-full sm:w-auto flex-grow">
              <h3 className="font-medium mb-1 text-foreground">Selected Flights</h3>
              <div className="flex flex-wrap gap-x-4">
                {selectedOutboundFlight ? (
                  <div className="text-sm">
                    <span className="text-foreground font-medium">Outbound:</span> {selectedOutboundFlight.origin} → {selectedOutboundFlight.destination} ({formatTime(selectedOutboundFlight.departureTime)})
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">No outbound flight selected</div>
                )}

                {tripType === 'round-trip' && (
                  selectedReturnFlight ? (
                    <div className="text-sm">
                      <span className="text-foreground font-medium">Return:</span> {selectedReturnFlight.origin} → {selectedReturnFlight.destination} ({formatTime(selectedReturnFlight.departureTime)})
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No return flight selected</div>
                  )
                )}
              </div>
            </div>

            {/* Right side with travelers, price and CTA in a more compact layout */}
            <div className="w-full sm:w-auto flex items-center gap-4">
              {/* Travelers selector - more compact */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-foreground">Travelers:</span>
                <div className="flex items-center border border-border rounded-md h-8">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onTravelersChange(Math.max(1, travelers - 1))}
                    disabled={travelers <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-8 text-center">{travelers}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onTravelersChange(Math.min(9, travelers + 1))}
                    disabled={travelers >= 9}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Price and CTA together for better connection */}
              <div className="flex items-center gap-3">
                <div className="text-lg font-bold text-primary">
                  {formatPrice(getTotalPrice())}
                </div>
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-4"
                  disabled={!canAddToCart()}
                  onClick={handleAddToCart}
                >
                  {canAddToCart() ? 'Add to Cart' : `Select ${tripType === 'one-way' ? 'flight' : 'flights'}`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add To Booking Modal */}
      <AddToBookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedOutboundFlight={selectedOutboundFlight}
        selectedReturnFlight={selectedReturnFlight}
        travelers={travelers}
        modalType="flight"  // Add this prop
      />
    </>
  );
};