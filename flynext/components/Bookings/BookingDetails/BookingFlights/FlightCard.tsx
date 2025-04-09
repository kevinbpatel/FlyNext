import React from 'react';
import { Plane, Loader2, Ticket, XCircle } from 'lucide-react';
import { FlightCardProps } from './types';
import { formatDateTime, getStatusColor, getStatusIcon } from './utils';

// Note: You may need to update getStatusColor and getStatusIcon functions
// to return dark mode compatible color classes if they're not already

const FlightCard: React.FC<FlightCardProps> = ({
  flight,
  formatCurrency,
  bookingStatus = '',
  removingFlightId,
  handleRemoveFlight,
  flightVerifications,
  isVerifying
}) => {
  // Generate status display
  const renderFlightStatus = () => {
    // Only show status for non-pending flights
    if (!flight.status || flight.status.toLowerCase() === 'pending') {
      console.log(`⏭️ Skipping status display for pending flight: ${flight.id}`);
      return null;
    }

    // If flight is canceled, we don't need to show detailed status
    if (flight.status.toLowerCase() === 'canceled') {
      return null;
    }

    const flightId = flight.flightId;
    const verification = flightVerifications[flightId];

    console.log(`🔍 Generating status display for flight ${flightId}:`, {
      flightStatus: flight.status,
      hasVerification: !!verification,
      verificationStatus: verification?.status,
      isVerifying
    });

    return (
      <div className="mt-2 space-y-1">
        {/* Reservation Status - always show for confirmed */}
        <p className="text-xs font-medium flex items-center text-blue-600 dark:text-blue-400">
          <Ticket className="w-3 h-3 mr-1" />
          Reservation: Confirmed
        </p>

        {/* Flight Status - only show for confirmed reservations with verification data */}
        {flight.status?.toLowerCase() === 'confirmed' && (
          <>
            {isVerifying && (
              <div className="flex items-center text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                Verifying flight...
              </div>
            )}

            {verification && verification.verified && verification.status && (
              <div>
                {/* Display flight status with appropriate color */}
                <p className={`text-xs font-medium flex items-center ${getStatusColor(verification.status)}`}>
                  {getStatusIcon(verification.status)}
                  Flight Status: {verification.status}
                </p>

                {verification.departureTime && (
                  <p className="text-xs text-muted-foreground">
                    Departure: {formatDateTime(verification.departureTime)}
                  </p>
                )}

                {verification.flightNumber && (
                  <p className="text-xs text-muted-foreground">
                    Flight: {verification.flightNumber}
                  </p>
                )}
              </div>
            )}

            {verification && !verification.verified && (
              <p className="text-xs text-red-500 dark:text-red-400 flex items-center">
                <XCircle className="w-3 h-3 mr-1" />
                {verification.message || 'Verification failed'}
              </p>
            )}

            {!verification && !isVerifying && (
              <p className="text-xs text-muted-foreground">
                Use "Verify Flights" to check flight status
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className={`p-5 relative ${flight.status === 'canceled' ? 'bg-red-100/50 dark:bg-red-900/20' : ''}`}>
      {flight.flightDetails ? (
        <div className="flex justify-between">
          {/* Left side with flight info */}
          <div className="flex">
            {/* Fixed circular logo with consistent dimensions */}
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
              flight.status === 'canceled' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10'
            }`}>
              <Plane className={`w-6 h-6 ${
                flight.status === 'canceled' ? 'text-red-600 dark:text-red-400' : 'text-primary'
              }`} />
            </div>
            <div>
              {/* Better color progression from darkest to medium to light */}
              <h3 className="text-base font-semibold text-card-foreground">
                {flight.flightDetails.originDetails.city} ({flight.flightDetails.origin}) → {flight.flightDetails.destinationDetails.city} ({flight.flightDetails.destination})
              </h3>
              <p className="text-sm text-muted-foreground mb-1">
                {new Date(flight.flightDetails.departureTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short'
                })}
              </p>
              <div className="flex items-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {flight.flightDetails.airline} · {flight.flightDetails.flightNumber}
                </p>
                {flight.status === 'canceled' && (
                  <span className="status-badge status-badge-cancelled">
                    Canceled
                  </span>
                )}
              </div>

              {/* Show status information */}
              {renderFlightStatus()}
            </div>
          </div>

          {/* Right side with price */}
          <div className="flex flex-col items-end justify-between">
            <p className={`font-semibold ${
              flight.status === 'canceled' ? 'text-muted-foreground line-through' : 'text-primary'
            }`}>
              {formatCurrency(flight.flightDetails.price)}
            </p>

            {/* Show Remove button ONLY for pending bookings */}
            {bookingStatus === 'pending' && (
              <button
                onClick={() => handleRemoveFlight(flight.id)}
                disabled={removingFlightId === flight.id}
                className={`flex items-center text-sm font-medium ${
                  removingFlightId === flight.id
                    ? 'text-muted-foreground cursor-not-allowed'
                    : 'text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors'
                }`}
              >
                {removingFlightId === flight.id ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Removing...
                  </>
                ) : (
                  'Remove'
                )}
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
              flight.status === 'canceled' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-primary/10'
            }`}>
              <Plane className={`w-6 h-6 ${
                flight.status === 'canceled' ? 'text-red-600 dark:text-red-400' : 'text-primary'
              }`} />
            </div>
            <div>
              <div className="flex items-center">
                <p className="font-medium text-card-foreground">Flight {flight.flightId}</p>
                {flight.status === 'canceled' && (
                  <span className="status-badge status-badge-cancelled">
                    Canceled
                  </span>
                )}
              </div>

              {/* Show status information */}
              {renderFlightStatus()}
            </div>
          </div>

          {/* Show Remove button ONLY for pending bookings */}
          {bookingStatus === 'pending' && (
            <button
              onClick={() => handleRemoveFlight(flight.id)}
              disabled={removingFlightId === flight.id}
              className={`flex items-center text-sm font-medium ${
                removingFlightId === flight.id
                  ? 'text-muted-foreground cursor-not-allowed'
                  : 'text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors'
              }`}
            >
              {removingFlightId === flight.id ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Removing...
                </>
              ) : (
                'Remove'
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FlightCard;