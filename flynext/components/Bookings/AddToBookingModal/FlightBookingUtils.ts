/**
 * Extracts a valid flight ID from potentially composite IDs
 * For multi-segment flights, we need to extract the complete first UUID
 */
export const extractFlightId = (compositeId: string) => {
  // UUID pattern: 8-4-4-4-12 hex digits with dashes
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

  // Try to match the first UUID in the string
  const match = compositeId.match(uuidPattern);

  if (match && match[0]) {
    // Found a valid UUID at the beginning
    console.log(`Extracted flight ID ${match[0]} from composite ID ${compositeId}`);
    return match[0];
  }

  // Fallback: Check if there are multiple UUIDs concatenated with dashes
  // Standard UUID has 4 dashes
  const dashCount = (compositeId.match(/-/g) || []).length;

  if (dashCount > 4) {
    // Assuming UUIDs are concatenated with an extra dash between them
    // Count 4 dashes from the start to get the first complete UUID
    let dashFound = 0;
    for (let i = 0; i < compositeId.length; i++) {
      if (compositeId[i] === '-') {
        dashFound++;
        if (dashFound === 4) {
          // Found the end of the first UUID
          const firstUuid = compositeId.substring(0, i + 1 + 12); // +12 for the characters after the last dash
          console.log(`Extracted first UUID ${firstUuid} from composite ID ${compositeId}`);
          return firstUuid;
        }
      }
    }
  }

  // If all else fails, return as is
  console.log(`Could not extract UUID pattern, returning original ID: ${compositeId}`);
  return compositeId;
};

/**
 * Splits a composite flight ID into individual UUIDs
 * @param compositeId A string containing one or more UUIDs joined with dashes
 * @returns An array of individual flight segment UUIDs
 */
export const splitFlightIds = (compositeId: string) => {
  // UUID pattern: 8-4-4-4-12 hex digits with dashes
  const uuidPattern = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;
  
  // Find all UUIDs in the string
  const matches = compositeId.match(uuidPattern);
  
  if (matches && matches.length > 0) {
    console.log(`Split composite ID ${compositeId} into ${matches.length} segments:`, matches);
    return matches;
  }
  
  // If no UUIDs found, return the original as a single-element array
  console.log(`No UUID pattern found, using original ID: ${compositeId}`);
  return [compositeId];
};

/**
 * Fetch bookings for the user
 */
export const fetchBookings = async (refreshToken?: () => Promise<void>) => {
  try {
    // Get the access token from localStorage
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    // Fetch bookings
    const response = await fetch('/api/bookings/view', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });

    // Handle token expiration
    if (response.status === 401 && refreshToken) {
      // Try to refresh the token
      await refreshToken();

      // Get the new token
      const newToken = localStorage.getItem("accessToken");
      if (!newToken) {
        throw new Error("Authentication failed. Please log in again.");
      }

      // Retry the request with the new token
      const retryResponse = await fetch('/api/bookings/view', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`
        }
      });

      if (!retryResponse.ok) {
        const data = await retryResponse.json();
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      const data = await retryResponse.json();
      return data.bookings || [];
    } else if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch bookings');
    } else {
      const data = await response.json();
      return data.bookings || [];
    }
  } catch (err) {
    console.error('Error fetching bookings:', err);
    throw err;
  }
};

/**
 * Add flights to a booking
 */
export const addFlightsToBooking = async ({
  selectedBookingId,
  selectedOutboundFlight,
  selectedReturnFlight,
  bookings
}: {
  selectedBookingId: string;
  selectedOutboundFlight: any | null;
  selectedReturnFlight: any | null;
  bookings: any[];
}) => {
  try {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      throw new Error("No access token found. Please log in again.");
    }

    // Track successful additions
    let outboundSegmentsAdded = 0;
    let outboundSegmentsTotal = 0;
    let returnSegmentsAdded = 0;
    let returnSegmentsTotal = 0;

    // Process outbound flight segments
    if (selectedOutboundFlight) {
      // Split the composite ID into individual flight IDs
      const outboundFlightIds = splitFlightIds(selectedOutboundFlight.id);
      outboundSegmentsTotal = outboundFlightIds.length;
      
      console.log(`Adding ${outboundFlightIds.length} outbound flight segments`);

      // Add each outbound flight segment
      for (const flightId of outboundFlightIds) {
        try {
          const outboundResponse = await fetch('/api/bookings/cart/add-flight', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              bookingId: selectedBookingId,
              flightId: flightId
            }),
          });

          if (!outboundResponse.ok) {
            const data = await outboundResponse.json();
            console.error(`Failed to add outbound segment ${flightId}:`, data.error);
          } else {
            const data = await outboundResponse.json();
            console.log(`Outbound segment ${flightId} added successfully:`, data);
            outboundSegmentsAdded++;
          }
        } catch (err) {
          console.error(`Error adding outbound segment ${flightId}:`, err);
        }
      }
    }

    // Process return flight segments
    if (selectedReturnFlight) {
      // Split the composite ID into individual flight IDs
      const returnFlightIds = splitFlightIds(selectedReturnFlight.id);
      returnSegmentsTotal = returnFlightIds.length;
      
      console.log(`Adding ${returnFlightIds.length} return flight segments`);

      // Add each return flight segment
      for (const flightId of returnFlightIds) {
        try {
          const returnResponse = await fetch('/api/bookings/cart/add-flight', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify({
              bookingId: selectedBookingId,
              flightId: flightId
            }),
          });

          if (!returnResponse.ok) {
            const data = await returnResponse.json();
            console.error(`Failed to add return segment ${flightId}:`, data.error);
          } else {
            const data = await returnResponse.json();
            console.log(`Return segment ${flightId} added successfully:`, data);
            returnSegmentsAdded++;
          }
        } catch (err) {
          console.error(`Error adding return segment ${flightId}:`, err);
        }
      }
    }

    // Wait a moment to ensure server processing completes
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Get booking details for the redirect
    const bookingDetails = bookings.find(b => b.id === selectedBookingId);
    const bookingName = bookingDetails?.name || 'your booking';

    // Check if any segments were successfully added
    if (outboundSegmentsAdded === 0 && returnSegmentsAdded === 0) {
      throw new Error('Failed to add any flight segments to the booking');
    }

    // Determine if we had partial success
    const outboundPartialSuccess = outboundSegmentsAdded > 0 && outboundSegmentsAdded < outboundSegmentsTotal;
    const returnPartialSuccess = returnSegmentsAdded > 0 && returnSegmentsAdded < returnSegmentsTotal;
    const anyPartialSuccess = outboundPartialSuccess || returnPartialSuccess;
    
    // Add query params to show what was successfully added
    let redirectParams = `bookingId=${selectedBookingId}&bookingName=${encodeURIComponent(bookingName)}`;
    
    if (anyPartialSuccess) {
      redirectParams += '&partialSuccess=true';
    }

    // Return results
    return {
      redirectParams,
      outboundSegmentsAdded,
      outboundSegmentsTotal,
      returnSegmentsAdded,
      returnSegmentsTotal,
      anyPartialSuccess
    };
  } catch (err) {
    console.error('Error adding flights to booking:', err);
    throw err;
  }
};