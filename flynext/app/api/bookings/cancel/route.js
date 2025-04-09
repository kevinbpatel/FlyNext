// app/api/bookings/cancel/route.js
import { NextResponse } from "next/server";
import { authenticate } from "@/utils/auth";
import prisma from "@/utils/db";
import { createUserNotification, createHotelOwnerNotification } from "@/utils/notificationUtils";

async function cancelAFSBooking(bookingReference, lastName) {
  console.log(`Attempting to cancel AFS booking: ${bookingReference} for ${lastName}`);
  
  try {
    const response = await fetch(
      "https://advanced-flights-system.replit.app/api/bookings/cancel",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.AFS_API_KEY,
        },
        body: JSON.stringify({
          bookingReference,
          lastName
        }),
      }
    );

    const responseText = await response.text();
    console.log(`AFS API response: ${responseText}`);
    
    if (!response.ok) {
      throw new Error(`AFS cancellation failed: ${responseText}`);
    }

    // Only try to parse as JSON if there's content
    return responseText ? JSON.parse(responseText) : {};
  } catch (error) {
    console.error("AFS cancellation error:", error);
    throw error;
  }
}

export async function DELETE(request) {
  
  try {
    // 1. Authenticate the user
    const userId = await authenticate(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // 2. Parse the request body
    const data = await request.json();
    
    // Extract parameters with multiple possible names for compatibility
    const bookingId = data.bookingId;
    const cancelAll = data.cancelAll || false;
    
    // Handle different parameter naming conventions for partial cancellation
    // These are now booking reference IDs, not individual flight IDs
    const cancelBookingReferences = data.cancelBookingReferences || data.cancelReferences || [];
    const cancelBookingRooms = data.cancelBookingRooms || data.cancelRooms || [];
    
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
        bookingRooms: {
          include: {
            room: true
          }
        },
        bookingFlights: {
          select: {
            id: true,
            bookingReference: true,
            status: true,
            flightId: true
          }
        },
        hotel: true
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
        { error: "You do not have permission to cancel this booking" },
        { status: 403 }
      );
    }
    
    // 4. Check if booking is already canceled
    if (booking.status === "canceled") {
      return NextResponse.json(
        { error: "Booking is already canceled" },
        { status: 400 }
      );
    }
    
    // 5. Process cancellation
    const canceledRooms = [];
    const canceledFlightIds = [];
    const afsResponses = [];
    
    // Get user's last name for AFS cancellation
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastName: true }
    });
    
    // For complete cancellation
    if (cancelAll) {
      // Group flights by booking reference
      const bookingReferences = new Set();
      booking.bookingFlights.forEach(flight => {
        if (flight.status !== "canceled" && flight.bookingReference) {
          bookingReferences.add(flight.bookingReference);
        }
      });
      
      // Cancel each unique booking reference (which cancels all flights under it)
      for (const reference of bookingReferences) {
        try {
          const afsResponse = await cancelAFSBooking(reference, user.lastName);
          afsResponses.push(afsResponse);
          
          // Mark all flights with this reference as canceled
          const flightsWithThisReference = booking.bookingFlights.filter(
            flight => flight.bookingReference === reference
          );
          
          for (const flight of flightsWithThisReference) {
            await prisma.bookingFlight.update({
              where: { id: flight.id },
              data: { status: "canceled" }
            });
            canceledFlightIds.push(flight.id);
          }
        } catch (error) {
          console.error(`Error canceling booking reference ${reference}:`, error);
          // Continue with other references if one fails
        }
      }
      
      // Update booking status
      await prisma.booking.update({
        where: { id: bookingId },
        data: {
          status: "canceled"
        }
      });
      
      // Create notifications
      try {
        await createUserNotification(
          userId, 
          `Your booking (${bookingId}) has been canceled.`
        );
        
        if (booking.hotel?.ownerId) {
          await createHotelOwnerNotification(
            booking.hotelId,
            `Booking ${bookingId} for your hotel has been canceled.`
          );
        }
      } catch (error) {
        console.error("Error creating notification:", error);
        // Continue if notification fails
      }
    } 
    // Handle partial cancellation
    else {
      // Cancel specific booking references
      if (cancelBookingReferences.length > 0) {
        for (const reference of cancelBookingReferences) {
          try {
            // Check if this reference exists in our booking
            const hasReference = booking.bookingFlights.some(
              flight => flight.bookingReference === reference && flight.status !== "canceled"
            );
            
            if (hasReference) {
              // Cancel with AFS API
              const afsResponse = await cancelAFSBooking(reference, user.lastName);
              afsResponses.push(afsResponse);
              
              // Update local database - mark all flights with this reference as canceled
              const flightsWithThisReference = booking.bookingFlights.filter(
                flight => flight.bookingReference === reference
              );
              
              for (const flight of flightsWithThisReference) {
                await prisma.bookingFlight.update({
                  where: { id: flight.id },
                  data: { status: "canceled" }
                });
                canceledFlightIds.push(flight.id);
              }
            }
          } catch (error) {
            console.error(`Error canceling booking reference ${reference}:`, error);
            // Continue with other references if one fails
          }
        }
      }
      
      // Cancel specific rooms (unchanged from original code)
      if (cancelBookingRooms.length > 0) {
        for (const roomId of cancelBookingRooms) {
          try {
            await prisma.bookingRoom.update({
              where: { id: roomId },
              data: { status: "canceled" }
            });
            canceledRooms.push(roomId);
          } catch (error) {
            console.error(`Error canceling room ${roomId}:`, error);
            // Continue with other rooms if one fails
          }
        }
      }
      
      // Check if there are any non-canceled rooms or flights left
      const remainingActiveRooms = await prisma.bookingRoom.count({
        where: { 
          bookingId,
          status: { not: "canceled" }
        }
      });
      
      const remainingActiveFlights = await prisma.bookingFlight.count({
        where: { 
          bookingId,
          status: { not: "canceled" }
        }
      });
      
      // If all items are canceled, cancel the entire booking
      if (remainingActiveRooms === 0 && remainingActiveFlights === 0) {
        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: "canceled"
          }
        });
      }
      
      // Create notification for partial cancellation
      try {
        await createUserNotification(
          userId,
          `Parts of your booking (${bookingId}) have been canceled.`
        );
      } catch (error) {
        console.error("Error creating notification:", error);
        // Continue if notification fails
      }
    }
    
    // 6. Fetch the latest booking state
    const finalBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingRooms: {
          include: {
            room: true
          }
        },
        bookingFlights: true,
        hotel: true
      }
    });
    
    // 7. Return updated booking information
    return NextResponse.json({
      message: cancelAll ? "Booking completely canceled" : "Booking partially canceled",
      booking: finalBooking,
      afsResponses: afsResponses,
      canceled: {
        all: cancelAll,
        bookingReferences: cancelBookingReferences,
        bookingFlights: canceledFlightIds,
        bookingRooms: canceledRooms
      }
    });
    
  } catch (error) {
    console.error("Cancel booking error:", error);
    return NextResponse.json(
      { error: "Failed to cancel booking", details: error.message },
      { status: 500 }
    );
  }
}