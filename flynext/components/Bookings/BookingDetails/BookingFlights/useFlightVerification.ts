import { useState, useCallback } from 'react';

export interface FlightVerification {
  flightId: string;
  verified: boolean;
  bookingReference: string;
  status?: string;
  message?: string;
  hasChanges?: boolean;
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  origin?: string;
  destination?: string;
}

export interface VerificationResponse {
  message: string;
  booking: {
    id: string;
    status: string;
    passengerName: string;
  };
  flightVerifications: FlightVerification[];
  bookingReferences: string[];
  verificationTimestamp: string;
}

export function useFlightVerification(bookingId: string, fetchWithAuth: any, isAuthenticated: boolean) {
  const [verificationData, setVerificationData] = useState<VerificationResponse | null>(null);
  const [flightVerifications, setFlightVerifications] = useState<Record<string, FlightVerification>>({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  // Function to verify flights
  const verifyFlights = useCallback(async () => {
    if (!bookingId || !isAuthenticated) return;
    
    console.log('⚡ Starting flight verification for booking:', bookingId);
    setIsVerifying(true);
    setVerificationError(null);

    try {
      // Call the verify API endpoint
      console.log('🔍 Calling verification API...');
      console.log(`API endpoint: /api/bookings/verify?bookingId=${bookingId}`);
      
      const response = await fetchWithAuth(`/api/bookings/verify?bookingId=${bookingId}`);
      console.log('📡 API Response status:', response.status);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          console.error('❌ API Error (JSON):', errorData);
          throw new Error(errorData.error || 'Failed to verify flights');
        } else {
          const errorText = await response.text();
          console.error('❌ API Error (text):', errorText);
          throw new Error(`Error ${response.status}: ${response.statusText || 'Failed to verify flights'}`);
        }
      }

      // Clone the response before parsing (for debugging)
      const responseClone = response.clone();
      
      try {
        const data: VerificationResponse = await response.json();
        console.log('✅ Verification data received:', data);
        console.log('📝 Flight verifications count:', data.flightVerifications?.length || 0);
        
        // Save the full response data
        setVerificationData(data);

        // Create a map of flightId to verification info for easier lookup
        const verificationMap: Record<string, FlightVerification> = {};
        if (data.flightVerifications && Array.isArray(data.flightVerifications)) {
          data.flightVerifications.forEach((verification) => {
            if (verification && verification.flightId) {
              console.log(`🛫 Flight ${verification.flightId} verification:`, verification);
              verificationMap[verification.flightId] = verification;
            }
          });
        }

        console.log('🗺️ Final verification map:', verificationMap);
        setFlightVerifications(verificationMap);
      } catch (jsonError) {
        console.error('❌ JSON parsing error:', jsonError);
        
        // Try to get the raw response for debugging
        try {
          const responseText = await responseClone.text();
          console.error('📄 Raw response:', responseText);
        } catch (e) {
          console.error('❌ Could not read response text');
        }
        
        throw new Error('Invalid response format from server');
      }
    } catch (err) {
      console.error('❌ Error verifying flights:', err);
      setVerificationError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      console.log('🏁 Verification process completed');
      setIsVerifying(false);
    }
  }, [bookingId, fetchWithAuth, isAuthenticated]);

  return {
    verificationData,
    flightVerifications,
    isVerifying,
    verificationError,
    verifyFlights
  };
}