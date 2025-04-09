import React from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard } from 'lucide-react';
import { BookingSummaryProps } from './types';

const BookingSummary: React.FC<BookingSummaryProps> = ({
  bookingId,
  bookingFlightsLength,
  bookingRoomsLength,
  paymentStatus,
  calculateHotelCost,
  calculateFlightCost,
  calculateTotal,
  formatCurrency
}) => {
  const router = useRouter();

  return (
    <div className="bg-card text-card-foreground border border-border rounded-lg p-6 sticky top-6">
      <h2 className="text-xl font-medium text-foreground mb-6">Booking Summary</h2>

      {/* Items count */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-muted-foreground">Items</p>
        <p className="font-medium">{bookingFlightsLength + bookingRoomsLength}</p>
      </div>

      {/* Cost breakdown */}
      {/* Hotel Cost */}
      <div className="flex justify-between items-center py-2">
        <p className="text-foreground/80">Hotel Cost</p>
        <p className="text-foreground">{formatCurrency(calculateHotelCost())}</p>
      </div>

      {/* Flight Cost */}
      <div className="flex justify-between items-center py-2">
        <p className="text-foreground/80">Flight Cost</p>
        <p className="text-foreground">{formatCurrency(calculateFlightCost())}</p>
      </div>

      {/* Taxes & Fees */}
      <div className="flex justify-between items-center py-2">
        <p className="text-foreground/80">Taxes & Fees</p>
        <p className="text-foreground">{formatCurrency((calculateHotelCost() + calculateFlightCost()) * 0.15)}</p>
      </div>

      {/* Total */}
      <div className="border-t border-border mt-4 pt-4 mb-6">
        <div className="flex justify-between items-center">
          <p className="font-medium text-foreground">Total</p>
          <p className="font-bold text-xl text-primary">{formatCurrency(calculateTotal())}</p>
        </div>
      </div>

      {/* Payment button */}
      {paymentStatus === 'pending' && (
        <div>
          <button
            onClick={() => router.push(`/bookings/checkout/${bookingId}`)}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:bg-primary/90 transition duration-200 flex items-center justify-center"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            Complete Payment
          </button>
          <p className="text-sm text-muted-foreground mt-2 text-center">
            You'll be taken to our secure checkout page
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingSummary;