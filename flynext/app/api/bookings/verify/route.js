// app/api/bookings/verify/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";

export async function GET(request) {
  /*
    USER STORY FROM PROJECT DESCRIPTION:
    As a user, I want to verify my flight booking to ensure the flight schedule 
    remains as planned.
  */

  try {
    // 1. Authenticate the user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Get query parameters - only bookingId is required
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    
    if (!bookingId) {
      return NextResponse.json(
        { error: "Booking ID is required" },
        { status: 400 }
      );
    }
    
    // 3. Verify the booking exists and belongs to the user
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingFlights: true,
        user: {
          select: { lastName: true, firstName: true }
        }
      }
    });
    
    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }
    
    if (booking.userId !== userId) {
      return NextResponse.json(
        { error: "You do not have permission to verify this booking" },
        { status: 403 }
      );
    }
    
    // 4. Check if there are flight bookings
    if (!booking.bookingFlights || booking.bookingFlights.length === 0) {
      return NextResponse.json(
        { error: "No flights found in this booking" },
        { status: 400 }
      );
    }
    
    // 5. Get all unique booking references from bookingFlights
    const uniqueBookingReferences = [...new Set(
      booking.bookingFlights
        .filter(bf => bf.bookingReference)
        .map(bf => bf.bookingReference)
    )];
    
    if (uniqueBookingReferences.length === 0) {
      return NextResponse.json(
        { error: "No flight booking references found for this booking" },
        { status: 400 }
      );
    }
    
    const lastName = booking.user.lastName;
    const flightVerifications = [];
    
    // 6. Verify each booking reference with AFS API
    try {
      // Create a map to track which flights have been verified
      const verifiedFlights = new Set();
      
      // Process each booking reference
      for (const bookingReference of uniqueBookingReferences) {
        const verifyResponse = await fetch(
          `https://advanced-flights-system.replit.app/api/bookings/retrieve?bookingReference=${bookingReference}&lastName=${lastName}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": process.env.AFS_API_KEY,
            }
          }
        );
        
        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.text();
          console.error(`AFS Verification Error for reference ${bookingReference}:`, errorData);
          
          // Add verification failure entries for flights using this reference
          const affectedFlights = booking.bookingFlights.filter(bf => bf.bookingReference === bookingReference);
          for (const flight of affectedFlights) {
            flightVerifications.push({
              flightId: flight.flightId,
              verified: false,
              bookingReference,
              message: `Verification failed: ${errorData || 'Unknown error'}`,
              status: 'VERIFICATION_FAILED'
            });
            
            // Mark as processed
            verifiedFlights.add(flight.flightId);
          }
          
          // Continue to next booking reference
          continue;
        }
        
        const verificationResult = await verifyResponse.json();
        
        // 7. Compare the current flight status with the stored flight information
        if (verificationResult.flights && verificationResult.flights.length > 0) {
          // Map of flight IDs to status from AFS
          const afsFlightStatuses = {};
          for (const flight of verificationResult.flights) {
            afsFlightStatuses[flight.id] = {
              status: flight.status,
              departureTime: flight.departureTime,
              arrivalTime: flight.arrivalTime,
              flightNumber: flight.flightNumber,
              origin: flight.origin,
              destination: flight.destination
            };
          }
          
          // Check each booked flight that uses this booking reference
          const referenceFlights = booking.bookingFlights.filter(bf => bf.bookingReference === bookingReference);
          
          for (const bookingFlight of referenceFlights) {
            const flightId = bookingFlight.flightId;
            
            // Skip if already verified (avoid duplicates)
            if (verifiedFlights.has(flightId)) continue;
            
            const afsFlightInfo = afsFlightStatuses[flightId];
            
            if (afsFlightInfo) {
              flightVerifications.push({
                flightId,
                verified: true,
                bookingReference,
                status: afsFlightInfo.status, // Use actual status from API response
                flightNumber: afsFlightInfo.flightNumber,
                departureTime: afsFlightInfo.departureTime,
                arrivalTime: afsFlightInfo.arrivalTime,
                origin: afsFlightInfo.origin,
                destination: afsFlightInfo.destination
                // Removed hasChanges property
              });
            } else {
              flightVerifications.push({
                flightId,
                verified: false,
                bookingReference,
                message: "Flight not found in AFS verification response",
                status: 'NOT_FOUND'
              });
            }
            
            // Mark as processed
            verifiedFlights.add(flightId);
          }
        } else {
          // Handle case where verification returned no flights
          const referenceFlights = booking.bookingFlights.filter(bf => bf.bookingReference === bookingReference);
          
          for (const bookingFlight of referenceFlights) {
            const flightId = bookingFlight.flightId;
            
            // Skip if already verified
            if (verifiedFlights.has(flightId)) continue;
            
            flightVerifications.push({
              flightId,
              verified: false,
              bookingReference,
              message: "No flights returned in AFS verification response",
              status: 'NO_FLIGHTS_RETURNED'
            });
            
            // Mark as processed
            verifiedFlights.add(flightId);
          }
        }
      }
      
      // 8. Check for any flights that weren't processed (missing booking reference)
      const unprocessedFlights = booking.bookingFlights.filter(
        bf => !verifiedFlights.has(bf.flightId)
      );
      
      for (const flight of unprocessedFlights) {
        flightVerifications.push({
          flightId: flight.flightId,
          verified: false,
          bookingReference: flight.bookingReference || 'missing',
          message: flight.bookingReference ? 
            "Flight verification failed" : 
            "Missing booking reference for flight",
          status: 'MISSING_REFERENCE'
        });
      }
      
      // 9. Return the verification result
      return NextResponse.json({
        message: "Flight verification completed",
        booking: {
          id: booking.id,
          status: booking.status,
          passengerName: `${booking.user.firstName} ${booking.user.lastName}`
        },
        flightVerifications,
        bookingReferences: uniqueBookingReferences,
        verificationTimestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error("AFS verification error:", error);
      return NextResponse.json(
        { error: "Failed to contact AFS for verification", details: error.message },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Flight verification error:", error);
    
    return NextResponse.json(
      { error: "Failed to verify flight", details: error.message },
      { status: 500 }
    );
  }
}